import { AIAction } from "../../../ai/AIAction/AIAction";
import { AIStateConfig } from "../../../ai/AIState/AIStateTypes";
import { AIStateRoute } from "../../../contexts/AIStateContext/AIStateRouting";
import { ContentState } from "../../../contexts/ContentStateContext/ContentStateContext";

const aiActionLookup = new Map<string, AIAction>();

const findAndSetAIAction = async (
    config: AIStateConfig,
    route: AIStateRoute,
    setAIAction: React.Dispatch<React.SetStateAction<AIAction | undefined>>,
    bumpInvalidated: () => void,
    getContentState: () => ContentState,
) => {
    if (config && route) {
        if (route.aiActionGroup) {
        } else {
            const newAIActionConstructor =
                route.aiActions[route.aiActionFocus || 0];
            const uniqueLookupKey = `${
                newAIActionConstructor.name
            }-${JSON.stringify({
                ...route,
                aiActions: undefined,
            })}`;
            if (!aiActionLookup.get(uniqueLookupKey)) {
                const newAIAction = new newAIActionConstructor(
                    config,
                    bumpInvalidated,
                    getContentState,
                );
                setAIAction(newAIAction);
                aiActionLookup.set(uniqueLookupKey, newAIAction);
            }
            const newAIAction = aiActionLookup.get(uniqueLookupKey);
            setAIAction(newAIAction);
        }
    }
};

export default findAndSetAIAction;
