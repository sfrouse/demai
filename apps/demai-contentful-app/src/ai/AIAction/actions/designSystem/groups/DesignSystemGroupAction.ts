import { AppError } from "../../../../../contexts/ErrorContext/ErrorContext";
import { AIAction } from "../../../AIAction";
import {
    AIActionExecuteResults,
    AIActionPhase,
    AIActionRunResults,
} from "../../../AIActionTypes";
import { ChangeTokenColorSetAction } from "../ChangeTokenColorSetAction";
import { BindingPerCTypeAction } from "./BindingPerCTypeAction";

export class DesignSystemGroupAction extends AIAction {
    static label = "Design System Group";

    // no preload b/c children should manage that
    async run(addError: (err: AppError) => void): Promise<AIActionRunResults> {
        const results: AIActionRunResults = {
            success: true,
            result: ``,
        };

        this.updateSnapshot({
            isRunning: true,
            request: "Run Design System Group",
            startRunTime: Date.now(),
            startExecutionRunTime: Date.now(),
        });

        this.addChildActions([
            new ChangeTokenColorSetAction(
                this.config,
                this.getContentState,
                this.loadProperty,
            ),
            new BindingPerCTypeAction(
                this.config,
                this.getContentState,
                this.loadProperty,
            ),
        ]);

        await this.runAllChildren(
            addError,
            {
                ignoreContextContent: false,
                autoExecute: true, // false,
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
