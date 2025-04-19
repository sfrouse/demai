import {
    AIActionConfig,
    AIActionExecuteResults,
    AIActionPhase,
    AIActionRunResults,
    AIActionSnapshot,
} from "../../AIActionTypes";
import { AIAction } from "../../AIAction";
import { ContentState } from "../../../../contexts/ContentStateContext/ContentStateContext";
import { AppError } from "../../../../contexts/ErrorContext/ErrorContext";
import createAndSaveAsset from "./utils/createAndSaveAsset";

export class AssetCreationAction extends AIAction {
    static label = "Asset Creation";

    async loadNeededData(): Promise<void> {
        this.loadProperty("assets");
    }

    async postExeDataUpdates(): Promise<void> {
        this.loadProperty("assets", true);
    }

    constructor(
        config: AIActionConfig,
        getContentState: () => ContentState,
        loadProperty: (key: keyof ContentState, forceRefresh?: boolean) => void,
        snapshotOverrides?: Partial<AIActionSnapshot>,
    ) {
        super(config, getContentState, loadProperty, snapshotOverrides);

        this.introMessage = "What kind of image would you like to make?";
        this.executionPrompt = "Saving image to assets";
        this.placeholder =
            "Describe what you would like this image to be like. Try to be descriptive...";
        this.toolType = "none";
    }

    async run(addError: (err: AppError) => void): Promise<AIActionRunResults> {
        return this.runAnswerOrDescribe(addError);
    }

    async runAnswerOrDescribe(
        addError: (err: AppError) => void,
    ): Promise<AIActionRunResults> {
        const results: AIActionRunResults = {
            success: true,
            result: ``,
        };
        const contentState = this.getContentState();

        this.updateSnapshot({
            isRunning: true,
            request: this.content(contentState),
            startRunTime: Date.now(),
            startExecutionRunTime: Date.now(),
        });

        await this._loadNeededData();

        const newAsset = await createAndSaveAsset(
            this,
            this.content(contentState),
        );

        if (newAsset.success) {
            this.updateSnapshot({
                isRunning: false,
                phase: AIActionPhase.executed,
                response: `
*Asset :*
${newAsset.asset.fields.description["en-US"]}:

<img src="${newAsset.asset.fields.file["en-US"].url}" alt="${newAsset.asset.fields.title["en-US"]}" width="200" height="200" />

[Contentful Asset](https://app.contentful.com/spaces/${this.config.spaceId}/environments/${this.config.environmentId}/assets/${newAsset.asset.sys.id})


`,
                runTime: Date.now() - this.startRunTime!,
                executeRunTime: Date.now() - this.startExecutionRunTime!,
            });
        } else {
            this.updateSnapshot({
                isRunning: false,
                phase: AIActionPhase.executed,
                response: `Error creating asset: ${newAsset.errors?.join(
                    ", ",
                )}`,
                runTime: Date.now() - this.startRunTime!,
                executeRunTime: Date.now() - this.startExecutionRunTime!,
            });
            addError({
                service: "Asset Creation",
                message: `Error creating asset: ${newAsset.errors?.join(", ")}`,
                showDialog: true,
            });
        }

        return results;
    }

    async runExe(
        addError: (err: AppError) => void,
    ): Promise<AIActionExecuteResults> {
        const runResults = await this.run(addError);
        return {
            success: true,
            result: "executed in run",
            toolCalls: [],
            toolResults: [],
        };
    }
}
