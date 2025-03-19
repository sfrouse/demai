import React, { createContext, useContext, useEffect, useState } from "react";
import AIState from "../../ai/AIState/AIState";
import AISessionManager from "../../ai/AIState/AISessionManager";
import { AIStateConfig, AIStateStatus } from "../../ai/AIState/AIStateTypes";
import findAISessionManager from "../../locations/page/utils/findAISessionManager";
import { AIPromptEngineID } from "../../ai/AIState/utils/createAIPromptEngine";

// Define the shape of the context
interface AIStateContextType {
  aiStateConfig?: AIStateConfig;
  setAIStateConfig: React.Dispatch<
    React.SetStateAction<AIStateConfig | undefined>
  >;

  aiState?: AIState;
  setAIState: React.Dispatch<React.SetStateAction<AIState | undefined>>;

  aiStateStatus?: AIStateStatus;
  setAIStateStatus: React.Dispatch<
    React.SetStateAction<AIStateStatus | undefined>
  >;

  setAISessionManager: React.Dispatch<
    React.SetStateAction<AISessionManager | undefined>
  >; // Setter only, no stored value

  aiSession: AIState[];
  setAISession: React.Dispatch<React.SetStateAction<AIState[]>>;

  invalidated: number;
  setInvalidated: React.Dispatch<React.SetStateAction<number>>;

  findAndSetAISessionManager: (
    aiStateEngineId: AIPromptEngineID,
    context?: string
  ) => Promise<AISessionManager | void>;
}

// Create the context
const AIStateContext = createContext<AIStateContextType | undefined>(undefined);

export const AIStateProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [aiStateConfig, setAIStateConfig] = useState<AIStateConfig>();
  const [aiState, setAIState] = useState<AIState>();
  const [aiStateStatus, setAIStateStatus] = useState<AIStateStatus>();
  const [, setAISessionManager] = useState<AISessionManager>(); // No need to store, just setter
  const [aiSession, setAISession] = useState<AIState[]>([]);
  const [invalidated, setInvalidated] = useState<number>(0);

  const findAndSetAISessionManager = async (
    aiStateEngineId: AIPromptEngineID,
    context: string = ""
  ) => {
    if (aiStateConfig) {
      const newAIStackManager = findAISessionManager(
        `${aiStateEngineId}${context ? `-${context}` : ``}`, // nav.aiStateEngine,
        setAISession,
        setAIState
      );
      setAISessionManager(newAIStackManager);
      let newFocusedAIState = newAIStackManager.getLastState();
      if (!newFocusedAIState) {
        const newAIState = new AIState(
          newAIStackManager,
          aiStateConfig,
          setAIStateStatus,
          aiStateEngineId,
          () => setInvalidated((prev) => prev + 1),
          true
        );
        newAIStackManager.addAndActivateAIState(newAIState);
      } else {
        newAIStackManager.refreshState();
        setAIState(newFocusedAIState);
        newFocusedAIState.refreshState();
      }
      return newAIStackManager;
    }
  };

  useEffect(() => {
    if (aiState) {
      aiState.contentChangeEvent = () => setInvalidated((prev) => prev + 1);
      aiState.setAIStateStatus = setAIStateStatus;
    }
  }, [aiState, setInvalidated, setAIStateStatus]);

  return (
    <AIStateContext.Provider
      value={{
        aiStateConfig,
        setAIStateConfig,
        aiState,
        setAIState,
        aiStateStatus,
        setAIStateStatus,
        setAISessionManager, // Setter function only
        aiSession,
        setAISession,
        invalidated,
        setInvalidated,
        findAndSetAISessionManager,
      }}
    >
      {children}
    </AIStateContext.Provider>
  );
};

// Hook to use the AI state context
export const useAIState = () => {
  const context = useContext(AIStateContext);
  if (!context) {
    throw new Error("useAIState must be used within an AIStateProvider");
  }
  return context;
};
