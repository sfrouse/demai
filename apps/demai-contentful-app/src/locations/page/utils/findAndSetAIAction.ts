import { AIAction } from "../../../ai/AIAction/AIAction";
import { AIActionConfig } from "../../../ai/AIAction/AIActionTypes";
import { AIStateRoute } from "../../../contexts/AIStateContext/AIStateRouting";
import { ContentState } from "../../../contexts/ContentStateContext/ContentStateContext";

const aiActionLookup = new Map<string, AIAction>();

const findAndSetAIAction = async (
    config: AIActionConfig,
    route: AIStateRoute,
    setAIAction: React.Dispatch<React.SetStateAction<AIAction | undefined>>,
    loadProperty: (key: keyof ContentState, forceRefresh?: boolean) => void,
    getContentState: () => ContentState,
) => {
    if (config && route) {
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
                getContentState,
                loadProperty,
            );
            setAIAction(newAIAction);
            aiActionLookup.set(uniqueLookupKey, newAIAction);
        }
        const newAIAction = aiActionLookup.get(uniqueLookupKey);
        setAIAction(newAIAction);
    }
};

export default findAndSetAIAction;
