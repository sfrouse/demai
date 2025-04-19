import { DEMAI_GENERATED_TAG_ID } from "../../../../../constants";
import createCMAEnvironment from "../../../../../contexts/AIStateContext/utils/createCMAEnvironment";
import { AppError } from "../../../../../contexts/ErrorContext/ErrorContext";
import { AIAction } from "../../../AIAction";
import {
    AIActionExecuteResults,
    AIActionPhase,
    AIActionRunResults,
} from "../../../AIActionTypes";
import { CreateAssetForEntryAction } from "../assets/CreateAssetForEntryAction";

export class ContentfulAssetsGroupAction extends AIAction {
    static label = "Contentful Asset For Entry Group";

    async loadNeededData(): Promise<void> {
        await Promise.all([
            this.loadProperty("entries"),
            this.loadProperty("contentTypes"),
        ]);
    }

    async postExeDataUpdates(): Promise<void> {
        await Promise.all([
            this.loadProperty("assets", true),
            this.loadProperty("entries", true),
        ]);
    }

    async run(addError: (err: AppError) => void): Promise<AIActionRunResults> {
        const results: AIActionRunResults = {
            success: true,
            result: ``,
        };

        this.updateSnapshot({
            isRunning: true,
            request: "Run contentful group",
            startRunTime: Date.now(),
            startExecutionRunTime: Date.now(),
        });

        // await this.deletePriorAssets();
        // this.loadProperty("assets", true);

        const contentState = this.getContentState();

        const ctypes = contentState.contentTypes;
        const entries = contentState.entries;
        let childActions: AIAction[] = [];

        entries?.map((entry) => {
            const ctype = ctypes?.find(
                (ct) => ct.sys.id === entry.sys.contentType.sys.id,
            );

            if (!ctype) {
                addError({
                    service: ContentfulAssetsGroupAction.label,
                    message: `Could not find content type for entry ${entry.sys.id}`,
                });
                return;
            }

            const imageField = ctype.fields.find(
                (field) => field.type === "Link" && field.linkType === "Asset",
            );

            if (!imageField) return;

            const fieldValue = entry.fields?.[imageField.id];

            if (fieldValue) return; // 🔁 skip if entry already has an asset

            childActions.push(
                new CreateAssetForEntryAction(
                    this.config,
                    this.getContentState,
                    this.loadProperty,
                    {
                        contextContentSelections: {
                            [CreateAssetForEntryAction.ASSET_FOR_ENTRY_ENTRY_ID]:
                                entry.sys.id,
                        },
                    },
                ),
            );

            return true;
        });

        this.addChildActions(childActions);

        await this.runAllChildren(
            addError,
            {
                ignoreContextContent: false,
                autoExecute: true,
            },
            false,
        );

        this.updateSnapshot({
            isRunning: false,
            phase: AIActionPhase.executed,
            runTime: Date.now() - this.startRunTime!,
            executeRunTime: Date.now() - this.startExecutionRunTime!,
        });
        return results;
    }

    async runAnswerOrDescribe(
        addError: (err: AppError) => void,
    ): Promise<AIActionRunResults> {
        return this.run(addError);
    }

    async runExe(
        addError: (err: AppError) => void,
    ): Promise<AIActionExecuteResults> {
        const runResults = await this.run(addError);
        return {
            ...runResults,
            toolCalls: [],
            toolResults: [],
        };
    }
}
