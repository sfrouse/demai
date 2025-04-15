import React, { useEffect, useState } from "react";
import AIState from "../../ai/AIState/AIState";
import AISessionManager from "../../ai/AIState/AISessionManager";
import { AIStateConfig, AIStateStatus } from "../../ai/AIState/AIStateTypes";
import { AIActionConstructor, AIStateRoute } from "./AIStateRouting";
import { AIStateContext } from "./useAIState";
// import { AIPromptEngineID } from "../../ai/AIPromptEngine/AIPromptEngineTypes";
import { AIAction } from "../../ai/AIAction/AIAction";

// Define the shape of the context
export interface AIStateContextType {
    aiStateConfig?: AIStateConfig;
    setAIStateConfig: React.Dispatch<
        React.SetStateAction<AIStateConfig | undefined>
    >;

    aiAction?: AIAction;
    setAIAction: React.Dispatch<React.SetStateAction<AIAction | undefined>>;

    aiState?: AIState;
    setAIState: React.Dispatch<React.SetStateAction<AIState | undefined>>;

    aiStateStatus?: AIStateStatus;
    setAIStateStatus: React.Dispatch<
        React.SetStateAction<AIStateStatus | undefined>
    >;

    aiSessionManager?: AISessionManager;
    setAISessionManager: React.Dispatch<
        React.SetStateAction<AISessionManager | undefined>
    >; // Setter only, no stored value

    aiSession: AIState[];
    setAISession: React.Dispatch<React.SetStateAction<AIState[]>>;

    invalidated: number;
    setInvalidated: React.Dispatch<React.SetStateAction<number>>;

    findAndSetAIAction: (
        aiConstructor: AIActionConstructor,
        route: AIStateRoute,
    ) => Promise<AISessionManager | void>;

    route?: AIStateRoute;
    setRoute: React.Dispatch<React.SetStateAction<AIStateRoute | undefined>>;

    autoExecute: boolean;
    setAutoExecute: React.Dispatch<React.SetStateAction<boolean>>;

    ignoreContextContent: boolean;
    setIgnoreContextContent: React.Dispatch<React.SetStateAction<boolean>>;
}

const aiActionLookup = new Map<string, AIAction>();

export const AIStateProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [aiStateConfig, setAIStateConfig] = useState<AIStateConfig>();
    const [aiAction, setAIAction] = useState<AIAction>();
    const [aiState, setAIState] = useState<AIState>();
    const [aiStateStatus, setAIStateStatus] = useState<AIStateStatus>();
    const [autoExecute, setAutoExecute] = useState<boolean>(false);
    const [ignoreContextContent, setIgnoreContextContent] =
        useState<boolean>(false);
    const [aiSessionManager, setAISessionManager] =
        useState<AISessionManager>(); // No need to store, just setter
    const [aiSession, setAISession] = useState<AIState[]>([]);
    const [invalidated, setInvalidated] = useState<number>(0);
    const [route, setRoute] = useState<AIStateRoute>();

    const findAndSetAIAction = async (
        aiConstructor: AIActionConstructor,
        route: AIStateRoute,
    ) => {
        if (aiStateConfig) {
            const uniqueLookupKey = `${aiConstructor.name}-${JSON.stringify({
                ...route,
                aiActions: undefined,
            })}`;
            if (!aiActionLookup.get(uniqueLookupKey)) {
                const newAIAction = new aiConstructor(aiStateConfig);
                setAIAction(newAIAction);
                aiActionLookup.set(uniqueLookupKey, newAIAction);
            }
            const newAIAction = aiActionLookup.get(uniqueLookupKey);
            setAIAction(newAIAction);
        }
    };

    useEffect(() => {
        if (aiState) {
            aiState.contentChangeEvent = () =>
                setInvalidated((prev) => prev + 1);
            aiState.setAIStateStatus = setAIStateStatus;
        }
    }, [aiState, setInvalidated, setAIStateStatus]);

    useEffect(() => {
        if (aiAction) {
            // refresh to latest
            aiAction.contentChangeEvent = () =>
                setInvalidated((prev) => prev + 1);
        }
    }, [aiAction, setInvalidated]);

    return (
        <AIStateContext.Provider
            value={{
                aiStateConfig,
                setAIStateConfig,
                aiState,
                setAIState,
                aiStateStatus,
                setAIStateStatus,
                aiSessionManager,
                setAISessionManager,
                aiSession,
                setAISession,
                invalidated,
                setInvalidated,
                findAndSetAIAction,
                route,
                setRoute,
                autoExecute,
                setAutoExecute,
                ignoreContextContent,
                setIgnoreContextContent,
                aiAction,
                setAIAction,
            }}
        >
            {children}
        </AIStateContext.Provider>
    );
};
