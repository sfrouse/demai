import React, { createContext, useContext, useState } from "react";
import AIState from "../../ai/AIState/AIState";
import AISessionManager from "../../ai/AIState/AISessionManager";
import { AIStateConfig, AIStateStatus } from "../../ai/AIState/AIStateTypes";

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
