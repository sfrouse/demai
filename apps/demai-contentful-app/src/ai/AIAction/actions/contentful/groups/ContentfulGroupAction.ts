import { AppError } from "../../../../../contexts/ErrorContext/ErrorContext";
import { AIAction } from "../../../AIAction";
import {
    AIActionExecuteResults,
    AIActionPhase,
    AIActionRunResults,
} from "../../../AIActionTypes";
import { CreateContentTypeAction } from "../CreateContentTypeAction";
import { DeleteGeneratedContentAction } from "../DeleteGeneratedContentAction";
import { ContentfulEntryPerCTypeAction } from "./ContentfulEntryPerCTypeAction";

export class ContentfulGroupAction extends AIAction {
    static label = "Contentful Group";

    // no preload b/c children should manage that
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
            new DeleteGeneratedContentAction(
                this.config,
                this.getContentState,
                this.loadProperty,
            ),
            new CreateContentTypeAction(
                this.config,
                this.getContentState,
                this.loadProperty,
                {
                    contextContentSelections: {
                        [CreateContentTypeAction.ACTION_CREATE_CTYPES_ID]:
                            CreateContentTypeAction
                                .ACTION_CREATE_CTYPES_OPTIONS[3],
                    },
                },
            ),
            new ContentfulEntryPerCTypeAction(
                this.config,
                this.getContentState,
                this.loadProperty,
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
