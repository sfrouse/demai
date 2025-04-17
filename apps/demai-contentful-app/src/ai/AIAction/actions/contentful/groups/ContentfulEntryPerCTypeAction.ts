import getContentTypes from "../../../../../contexts/ContentStateContext/services/getContentTypes";
import { AppError } from "../../../../../contexts/ErrorContext/ErrorContext";
import { AIAction } from "../../../AIAction";
import {
    AIActionExecuteResults,
    AIActionPhase,
    AIActionRunResults,
} from "../../../AIActionTypes";
import { CreateEntryAction } from "../CreateEntryAction";

export class ContentfulEntryPerCTypeAction extends AIAction {
    static label = "Contentful Entry Per CType Group";

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

        // need the latest
        const ctypes = await getContentTypes(this.config); // this.getContentState().contentTypes;
        let children: AIAction[] = [];

        if (ctypes) {
            children = ctypes.map(
                (ctype) =>
                    new CreateEntryAction(
                        this.config,
                        this.getContentState,
                        this.loadProperty,
                        {
                            contextContentSelections: {
                                [CreateEntryAction.CONTEXT_NUMBER_OF_TYPES]:
                                    "3",
                                [CreateEntryAction.CONTEXT_CTYPE_ID]:
                                    ctype.sys.id,
                            },
                        },
                    ),
            );
        }

        this.addChildActions(children);

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
