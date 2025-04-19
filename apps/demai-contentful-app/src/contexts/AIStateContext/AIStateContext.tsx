import React, { useState } from "react";
import { AIStateRoute } from "./AIStateRouting";
import { AIStateContext } from "./useAIState";
import { AIAction } from "../../ai/AIAction/AIAction";
import { AIActionConfig } from "../../ai/AIAction/AIActionTypes";
import { Environment } from "contentful-management";

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

    inspectedContent: string | undefined;
    setInspectedContent: React.Dispatch<
        React.SetStateAction<string | undefined>
    >;

    route?: AIStateRoute;
    setRoute: React.Dispatch<React.SetStateAction<AIStateRoute | undefined>>;

    autoExecute: boolean;
    setAutoExecute: React.Dispatch<React.SetStateAction<boolean>>;

    ignoreContextContent: boolean;
    setIgnoreContextContent: React.Dispatch<React.SetStateAction<boolean>>;

    ignoreStatusWarning: boolean;
    setIgnoreStatusWarning: React.Dispatch<React.SetStateAction<boolean>>;
}

// const aiActionLookup = new Map<string, AIAction>();

export const AIStateProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [aiActionConfig, setAIActionConfig] = useState<AIActionConfig>();
    const [aiAction, setAIAction] = useState<AIAction>();
    // const [environment, setEnvironment] = useState<Environment>();
    const [inspectedAIAction, setInspectedAIAction] = useState<AIAction>();
    const [autoExecute, setAutoExecute] = useState<boolean>(false);
    const [ignoreContextContent, setIgnoreContextContent] =
        useState<boolean>(false);
    const [route, setRoute] = useState<AIStateRoute>();
    const [inspectedContent, setInspectedContent] = useState<string>();
    const [ignoreStatusWarning, setIgnoreStatusWarning] =
        useState<boolean>(false);

    return (
        <AIStateContext.Provider
            value={{
                aiActionConfig,
                setAIActionConfig,
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
                inspectedContent,
                setInspectedContent,
                ignoreStatusWarning,
                setIgnoreStatusWarning,
            }}
        >
            {children}
        </AIStateContext.Provider>
    );
};
