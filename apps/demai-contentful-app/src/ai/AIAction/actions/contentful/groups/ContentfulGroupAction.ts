import { ContentState } from "../../../../../contexts/ContentStateContext/ContentStateContext";
import { AppError } from "../../../../../contexts/ErrorContext/ErrorContext";
import { AIAction } from "../../../AIAction";
import { AIActionPhase, AIActionRunResults } from "../../../AIActionTypes";

export class ContentfulGroupAction extends AIAction {
    static label = "Contentful Group";

    async runAnswerOrDescribe(
        contentState: ContentState,
        ignoreContextContent: boolean = false,
        addError: (err: AppError) => void,
        autoExecute: boolean = false,
    ): Promise<AIActionRunResults> {
        const results: AIActionRunResults = {
            success: true,
            result: ``,
        };

        this.updateSnapshot({
            isRunning: true,
            startRunTime: Date.now(),
            startExecutionRunTime: Date.now(),
        });

        // const results = super.runAnswerOrDescribe(
        //     contentState,
        //     ignoreContextContent,
        //     addError,
        //     autoExecute,
        // );

        this.updateSnapshot({
            isRunning: false,
            phase: AIActionPhase.executed,
            runTime: Date.now() - this.startRunTime!,
            executeRunTime: Date.now() - this.startExecutionRunTime!,
        });
        return results;
    }
}
