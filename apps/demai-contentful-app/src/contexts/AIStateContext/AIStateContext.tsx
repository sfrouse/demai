import React, { useState } from "react";
import { AIStateRoute } from "./AIStateRouting";
import { AIStateContext } from "./useAIState";
import { AIAction } from "../../ai/AIAction/AIAction";
import { AIActionConfig } from "../../ai/AIAction/AIActionTypes";

// Define the shape of the context
export interface AIStateContextType {
    aiActionConfig?: AIActionConfig;
    setAIActionConfig: React.Dispatch<
        React.SetStateAction<AIActionConfig | undefined>
    >;

    aiAction?: AIAction;
    setAIAction: React.Dispatch<React.SetStateAction<AIAction | undefined>>;

    inspectedAIAction?: AIAction;
    setInspectedAIAction: React.Dispatch<
        React.SetStateAction<AIAction | undefined>
    >;

    invalidated: number;
    setInvalidated: React.Dispatch<React.SetStateAction<number>>;
    bumpInvalidated: () => void;

    route?: AIStateRoute;
    setRoute: React.Dispatch<React.SetStateAction<AIStateRoute | undefined>>;

    autoExecute: boolean;
    setAutoExecute: React.Dispatch<React.SetStateAction<boolean>>;

    ignoreContextContent: boolean;
    setIgnoreContextContent: React.Dispatch<React.SetStateAction<boolean>>;
}

// const aiActionLookup = new Map<string, AIAction>();

export const AIStateProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [aiActionConfig, setAIActionConfig] = useState<AIActionConfig>();
    const [aiAction, setAIAction] = useState<AIAction>();
    const [inspectedAIAction, setInspectedAIAction] = useState<AIAction>();
    const [autoExecute, setAutoExecute] = useState<boolean>(false);
    const [ignoreContextContent, setIgnoreContextContent] =
        useState<boolean>(false);
    const [invalidated, setInvalidated] = useState<number>(0);
    const bumpInvalidated = () => setInvalidated((prev) => prev + 1);
    const [route, setRoute] = useState<AIStateRoute>();

    return (
        <AIStateContext.Provider
            value={{
                aiActionConfig,
                setAIActionConfig,
                invalidated,
                setInvalidated,
                bumpInvalidated,
                route,
                setRoute,
                autoExecute,
                setAutoExecute,
                ignoreContextContent,
                setIgnoreContextContent,
                aiAction,
                setAIAction,
                inspectedAIAction,
                setInspectedAIAction,
            }}
        >
            {children}
        </AIStateContext.Provider>
    );
};
