import { Environment } from "contentful-management";
import { AppError } from "../../../../contexts/ErrorContext/ErrorContext";
import { AIAction } from "../../AIAction";
import {
    AIActionExecuteResults,
    AIActionPhase,
    AIActionRunResults,
} from "../../AIActionTypes";
import createCMAEnvironment from "../../../../contexts/AIStateContext/utils/createCMAEnvironment";
import { DEMAI_RESEARCH_SINGLETON_ENTRY_ID } from "../../../mcp/researchMCP/validate/ctypes/demaiResearchCType";

export class DeleteGeneratedResearch extends AIAction {
    static label = "Delete Generated Research";

    async postExeDataUpdates(): Promise<void> {
        await Promise.all([this.loadProperty("research", true)]);
    }

    async run(addError: (err: AppError) => void): Promise<AIActionRunResults> {
        const results: AIActionRunResults = {
            success: true,
            result: ``,
        };

        this.updateSnapshot({
            isRunning: true,
            request: "Delete all generated content.",
            startRunTime: Date.now(),
            startExecutionRunTime: Date.now(),
        });

        await this.deleteResearch(addError);

        this.updateSnapshot({
            isRunning: false,
            phase: AIActionPhase.executed,
            response: `Deleted generated research.`,
            runTime: Date.now() - this.startRunTime!,
            executeRunTime: Date.now() - this.startExecutionRunTime!,
        });

        await this._postExeDataUpdates();
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

    async deleteResearch(addError: (err: AppError) => void) {
        try {
            const env: Environment = await createCMAEnvironment(
                this.config.cma,
                this.config.spaceId,
                this.config.environmentId,
            );

            const research = await env.getEntry(
                DEMAI_RESEARCH_SINGLETON_ENTRY_ID,
            );
            console.log("research", research);
            research.fields.primaryColor["en-US"] = "";
            research.fields.secondaryColor["en-US"] = undefined;
            research.fields.tertiaryColor["en-US"] = undefined;
            research.fields.description["en-US"] = undefined;
            research.fields.products["en-US"] = undefined;
            research.fields.tone["en-US"] = undefined;
            research.fields.style["en-US"] = undefined;

            console.log("research", research);
            const updatedEntry = await research.update();
            if (research.sys.publishedVersion) {
                await updatedEntry.publish();
            }

            return { success: true };
        } catch (err) {
            addError({
                service: "Deleting all DemAI Assets",
                message: "Error trying to delete assets related to DemAI",
                details: `${err}`,
            });
        }
    }
}
