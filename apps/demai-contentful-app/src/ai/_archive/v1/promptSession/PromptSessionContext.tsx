import React, { createContext, useContext, useState } from "react";
import {
  AIPromptMessage,
  AIPromptTemplate,
  MCP_TYPES,
} from "../../../openAI/openAIConfig";

export enum PromptSessionMode {
  exploringTools = "EXPLORING_TOOLS",
  readyToExecute = "READY_TO_EXECUTE",
  freeform = "FREEFORM",
}

export type PromptSessionState = {
  promptTemplate: AIPromptTemplate;
  conversationStack: AIPromptMessage[];
  isRunning: boolean;
  isReady: boolean;
  error?: string;
  mode: PromptSessionMode;
};

export type PromptSessionContextType = {
  state: PromptSessionState;
  setState: React.Dispatch<React.SetStateAction<PromptSessionState>>;
};

const PromptSessionContext = createContext<
  PromptSessionContextType | undefined
>(undefined);

export const PromptSessionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<PromptSessionState>({
    promptTemplate: {
      system: { content: "You are a general purpose agent" },
      user: { content: "" },
      mcp: MCP_TYPES.NONE,
    },
    conversationStack: [],
    isRunning: false,
    isReady: false,
    mode: PromptSessionMode.exploringTools,
  });

  return (
    <PromptSessionContext.Provider value={{ state, setState }}>
      {children}
    </PromptSessionContext.Provider>
  );
};

export const usePromptSession = () => {
  const context = useContext(PromptSessionContext);
  if (!context) {
    throw new Error(
      "usePromptSession must be used within a PromptSessionProvider"
    );
  }
  return context;
};
