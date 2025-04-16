import { AppError } from "../../../contexts/ErrorContext/ErrorContext";
import { AIAction } from "../AIAction";
import {
    AIActionExecuteResults,
    AIActionPhase,
    AIActionRunResults,
} from "../AIActionTypes";
import { ContentfulGroupAction } from "./contentful/groups/ContentfulGroupAction";
import { ResearchGroupAction } from "./research/groups/ResearchGroupAction";

export class MoneyAction extends AIAction {
    static label = "Contentful Group";

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

        this.addChildActions([
            new ResearchGroupAction(
                this.config,
                this.contentChangeEvent,
                this.getContentState,
            ),
            new ContentfulGroupAction(
                this.config,
                this.contentChangeEvent,
                this.getContentState,
            ),
        ]);

        await this.runAllChildren(addError, {
            ignoreContextContent: false,
            autoExecute: true, // false,
        });

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
