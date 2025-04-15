import { AIActionConstructor } from "../../../contexts/AIStateContext/AIStateRouting";
import { ContentState } from "../../../contexts/ContentStateContext/ContentStateContext";
import { AppError } from "../../../contexts/ErrorContext/ErrorContext";
import { AIAction } from "../AIAction";
import { AIActionExecuteResults } from "../AIActionTypes";

export default async function runExeChildAction(
    aiAction: AIAction,
    childAIActionConstructor: AIActionConstructor,
    childResponse: string,
    contentState: ContentState,
    addError: (err: AppError) => void,
    results: AIActionExecuteResults,
) {
    const childAIAction = new childAIActionConstructor(aiAction.config);
    childAIAction.contentChangeEvent = aiAction.contentChangeEvent;
    aiAction.updateSnapshot({
        childActions: [...aiAction.childActions, childAIAction],
    });
    childAIAction.updateSnapshot({
        response: childResponse,
    });
    const runExeResults = await childAIAction.runExe(contentState, addError);

    if (runExeResults.success === false) results.success = false;

    // merge tool results...
    results.toolCalls = [...results.toolCalls, ...runExeResults.toolCalls];
    results.toolResults = [
        ...results.toolResults,
        ...runExeResults.toolResults,
    ];
}
