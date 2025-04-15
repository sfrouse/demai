import { AIActionConstructor } from "../../../contexts/AIStateContext/AIStateRouting";
import { ContentState } from "../../../contexts/ContentStateContext/ContentStateContext";
import { AppError } from "../../../contexts/ErrorContext/ErrorContext";
import { AIAction } from "../AIAction";
import { AIActionRunResults, AIActionSnapshot } from "../AIActionTypes";

export default async function runChildAction(
    aiAction: AIAction,
    childAIActionConstructor: AIActionConstructor,
    childSnapshot: Partial<AIActionSnapshot>,
    contentState: ContentState,
    snapshotOverrides: {
        ignoreContextContent: boolean;
        autoExecute: boolean;
    } = {
        ignoreContextContent: false,
        autoExecute: false,
    },
    addError: (err: AppError) => void,
    results: AIActionRunResults,
) {
    const childAIAction = new childAIActionConstructor(aiAction.config);
    childAIAction.contentChangeEvent = aiAction.contentChangeEvent;
    aiAction.updateSnapshot({
        childActions: [...aiAction.childActions, childAIAction],
    });
    childAIAction.updateSnapshot(childSnapshot);
    const runResults = await childAIAction.runAnswerOrDescribe(
        contentState,
        addError,
        snapshotOverrides,
    );
    if (runResults.success === false) results.success = false;
}
