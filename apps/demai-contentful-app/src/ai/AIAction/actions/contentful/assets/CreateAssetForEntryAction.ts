import {
    AIActionConfig,
    AIActionPhase,
    AIActionRunResults,
    AIActionSnapshot,
} from "../../../AIActionTypes";
import { ContentState } from "../../../../../contexts/ContentStateContext/ContentStateContext";
import entryToAI from "../../../utils/entryToAI";
import { AssetCreationAction } from "./AssetCreationAction";
import { AppError } from "../../../../../contexts/ErrorContext/ErrorContext";
import { Entry } from "contentful";
import createCMAEnvironment from "../../../../../contexts/AIStateContext/utils/createCMAEnvironment";

export class CreateAssetForEntryAction extends AssetCreationAction {
    static label = "Create Asset for Entry";

    static ASSET_FOR_ENTRY_ENTRY_ID = "entryId";

    async loadNeededData(): Promise<void> {
        await Promise.all([
            this.loadProperty("entries"),
            this.loadProperty("contentTypes"),
            this.loadProperty("research"),
        ]);
    }

    async postExeDataUpdates(): Promise<void> {
        await Promise.all([
            this.loadProperty("assets", true),
            this.loadProperty("entries", true),
        ]);
    }

    focusedEntry: Entry | undefined;

    constructor(
        config: AIActionConfig,
        getContentState: () => ContentState,
        loadProperty: (key: keyof ContentState, forceRefresh?: boolean) => void,
        snapshotOverrides?: Partial<AIActionSnapshot>,
    ) {
        super(config, getContentState, loadProperty, snapshotOverrides);

        this.introMessage = "Let's create an asset for an entry";
        this.executionPrompt = "Saving Asset to Entry";
        this.placeholder =
            "Describe any extra instructions when creating an image for this entry.";
        this.toolType = "none";

        // CREATE CONTEXT
        this.contextContent = (contentState: ContentState) => {
            let defaultEntryValue = "",
                entryOptions: string[] = [],
                entryLabels: string[] = [];
            if (contentState.entries && contentState.entries.length > 0) {
                defaultEntryValue = `${contentState.entries[0].sys.id}`;
                contentState.entries?.map((entry) => {
                    const contentType = contentState.contentTypes?.find(
                        (ct) => ct.sys.id === entry.sys.contentType.sys.id,
                    );

                    const hasImage =
                        contentType &&
                        contentType.fields.find(
                            (field) =>
                                field.type === "Link" &&
                                field.linkType === "Asset",
                        );
                    if (!hasImage) return;

                    const label = contentType?.displayField
                        ? entry.fields[contentType.displayField]
                        : entry.fields?.title ||
                          entry.fields?.name ||
                          entry.sys.id;
                    entryLabels.push(`${label}`.substring(0, 30));
                    entryOptions.push(entry.sys.id);
                }) || [];
            }
            const context = [
                "Create an asset for ",
                {
                    id: CreateAssetForEntryAction.ASSET_FOR_ENTRY_ENTRY_ID,
                    options: entryOptions,
                    labels: entryLabels,
                    defaultValue: defaultEntryValue,
                },
            ];
            return context;
        };

        // CONTENT
        this.content = (contentState: ContentState) => {
            const entry = contentState.entries?.find(
                (entry) =>
                    entry.sys.id ===
                    this.contextContentSelections[
                        CreateAssetForEntryAction.ASSET_FOR_ENTRY_ENTRY_ID
                    ],
            );

            this.focusedEntry = entry;
            const contentType = contentState.contentTypes?.find(
                (ct) => ct.sys.id === entry?.sys.contentType.sys.id,
            );

            const label = contentType?.displayField
                ? entry?.fields[contentType.displayField]
                : entry?.fields?.title || entry?.fields?.name || entry?.sys.id;
            this.assetNameOverride = `${label} Asset`;
            this.assetDescriptionOverride = `${label} Asset`;

            const content = `
${this.userContent}

Lets create an asset that is appropriate for this entry and brand:

\`\`\`
${JSON.stringify(entryToAI(entry))}
\`\`\`

The brand description is:

\`\`\`
${contentState.research?.fields.description}
\`\`\`

`;
            return content;
        };
    }

    async runAnswerOrDescribe(
        addError: (err: AppError) => void,
    ): Promise<AIActionRunResults> {
        const results = await super.runAnswerOrDescribe(addError);

        this.updateSnapshot({
            isRunning: true,
            phase: AIActionPhase.executing,
            runTime: undefined,
            executeRunTime: undefined,
        });

        if (this.focusedEntry && this.asset) {
            const contentType = this.getContentState().contentTypes?.find(
                (ct) => ct.sys.id === this.focusedEntry?.sys.contentType.sys.id,
            );

            if (contentType) {
                const assetField = contentType.fields.find(
                    (field) =>
                        field.type === "Link" && field.linkType === "Asset",
                );

                if (assetField) {
                    const env = await createCMAEnvironment(
                        this.config.cma,
                        this.config.spaceId,
                        this.config.environmentId,
                    );

                    const entry = await env.getEntry(this.focusedEntry.sys.id);
                    const fieldId = assetField.id;
                    entry.fields[fieldId] = {
                        "en-US": {
                            sys: {
                                type: "Link",
                                linkType: "Asset",
                                id: this.asset.sys.id,
                            },
                        },
                    };

                    const updatedEntry = await entry.update();
                    await updatedEntry.publish();
                } else {
                    addError({
                        service: "Create Asset for Entry",
                        message: "No asset link field found for entry",
                        details: this.focusedEntry.sys.id,
                    });
                }
            } else {
                addError({
                    service: "Create Asset for Entry",
                    message: "Content type not found for entry",
                    details: this.focusedEntry.sys.id,
                });
            }
        } else {
            addError({
                service: "Create Asset for Entry",
                message: "Focused entry or asset is missing",
                details: "Cannot add asset to entry",
            });
        }

        this.updateSnapshot({
            isRunning: false,
            phase: AIActionPhase.executed,
            runTime: Date.now() - this.startRunTime!,
            executeRunTime: Date.now() - this.startExecutionRunTime!,
        });
        await this._postExeDataUpdates();
        return results;
    }
}
