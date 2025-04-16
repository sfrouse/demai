import { ContentState } from "../../../../contexts/ContentStateContext/ContentStateContext";
import { AIAction } from "../../AIAction";
import { AIActionConfig, AIActionSnapshot } from "../../AIActionTypes";

export class ContentfulOpenToolingAction extends AIAction {
    static label = "Contentful Tooling";

    constructor(
        config: AIActionConfig,
        contentChangeEvent: () => void,
        getContentState: () => ContentState,
        loadProperty: (key: keyof ContentState, forceRefresh?: boolean) => void,
        snapshotOverrides?: Partial<AIActionSnapshot>,
    ) {
        super(
            config,
            contentChangeEvent,
            getContentState,
            loadProperty,
            snapshotOverrides,
        );

        this.className = "ContentfulOpenToolingAction";
        this.system = {
            role: "system",
            content: `
You are an expert in Contentful, help this SE learn about Contentful demos.
Tell me explicitly what you are about to do including the name of the tool - this is the most important part of your task.

`,
        };
        this.toolType = "Contentful";
        this.executionPrompt = "Updating Contentful...";
        this.introMessage =
            "Let’s work with Contentful, what would you like to do?";
        this.placeholder =
            "Describe what you would like to do with Contentful. Try to be descriptive...";

        // testing
        this.contextContent = () => [];
    }
}
