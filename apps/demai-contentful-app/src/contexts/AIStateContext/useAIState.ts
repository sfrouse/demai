import { useContext, createContext } from "react";
import { AIStateContextType } from "./AIStateContext";

// Create the context
export const AIStateContext = createContext<AIStateContextType | undefined>(
  undefined
);
export default function useAIState() {
  const context = useContext(AIStateContext);
  if (!context) {
    console.log("AIStateContext, context", AIStateContext, context);
    throw new Error("useAIState must be used within an AIStateProvider");
  }
  return context;
}
