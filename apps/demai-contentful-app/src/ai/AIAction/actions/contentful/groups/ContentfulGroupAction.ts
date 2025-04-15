import { ContentState } from "../../../../../contexts/ContentStateContext/ContentStateContext";
import { AppError } from "../../../../../contexts/ErrorContext/ErrorContext";
import { AIAction } from "../../../AIAction";
import { AIActionPhase, AIActionRunResults } from "../../../AIActionTypes";
import { CreateContentTypeAction } from "../CreateContentTypeAction";
import { CreateEntryAction } from "../CreateEntryAction";

export class ContentfulGroupAction extends AIAction {
    static label = "Contentful Group";

    async runAnswerOrDescribe(
        contentState: ContentState,
        addError: (err: AppError) => void,
    ): Promise<AIActionRunResults> {
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
            new CreateContentTypeAction(this.config, {
                contextContentSelections: {
                    [CreateContentTypeAction.ACTION_CREATE_CTYPES_ID]:
                        CreateContentTypeAction.ACTION_CREATE_CTYPES_OPTIONS[3],
                },
            }),
            // new CreateEntryAction(this.config, {
            //     contextContentSelections: {
            //         [CreateEntryAction.CONTEXT_NUMBER_OF_TYPES]: "4",
            //     },
            // }),
        ]);

        await this.runAllChildren(contentState, addError, {
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
}
