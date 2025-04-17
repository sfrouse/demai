import { AppError } from "../../../../contexts/ErrorContext/ErrorContext";
import { AIActionPhase, AIActionRunResults } from "../../AIActionTypes";
import { DEMAI_SYSTEM_PROPERTY_IDENTIFIER } from "../../../../constants";
import { DeleteGeneratedContentAction } from "./DeleteGeneratedContentAction";

export class DeleteSystemContentAction extends DeleteGeneratedContentAction {
    static label = "Delete All DemAI System Content";

    async postExeDataUpdates(): Promise<void> {
        await Promise.all([
            this.loadProperty("contentTypes", true),
            this.loadProperty("components", true),
            this.loadProperty("css", true),
            this.loadProperty("ai", true),
            this.loadProperty("tokens", true),
            this.loadProperty("research", true),
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

        const deleteResults = await this.deleteAllCTypes(
            DEMAI_SYSTEM_PROPERTY_IDENTIFIER,
            addError,
        );

        this.updateSnapshot({
            isRunning: false,
            phase: AIActionPhase.executed,
            response: `Deleted \`${deleteResults?.total}\` content types and \`${deleteResults?.totalEntries}\` entries.`,
            runTime: Date.now() - this.startRunTime!,
            executeRunTime: Date.now() - this.startExecutionRunTime!,
        });
        return results;
    }
}
