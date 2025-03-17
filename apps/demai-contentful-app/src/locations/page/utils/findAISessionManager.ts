import AISessionManager from "../../../ai/AIState/AISessionManager";
import AIState from "../../../ai/AIState/AIState";

const aiSessionLookup = new Map();

export default function findAISessionManager(
  name: string, // can be anything
  setAISession: React.Dispatch<React.SetStateAction<AIState[]>>,
  setAIState: React.Dispatch<React.SetStateAction<AIState | undefined>>
): AISessionManager {
  if (!aiSessionLookup.get(name)) {
    const newAISessionManager = new AISessionManager(setAISession, setAIState);
    aiSessionLookup.set(name, newAISessionManager);
  }
  return aiSessionLookup.get(name);
}
