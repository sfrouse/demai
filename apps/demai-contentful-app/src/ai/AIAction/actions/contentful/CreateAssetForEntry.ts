import { AIActionConfig, AIActionSnapshot } from "../../AIActionTypes";
import { AIAction } from "../../AIAction";
import { ContentState } from "../../../../contexts/ContentStateContext/ContentStateContext";

export class CreateAssetForEntry extends AIAction {
    static label = "Create Asset for Entry";

    async loadNeededData(): Promise<void> {
        this.loadProperty("entries");
    }

    async postExeDataUpdates(): Promise<void> {
        this.loadProperty("assets", true);
        this.loadProperty("entries", true);
    }

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
    }
}
