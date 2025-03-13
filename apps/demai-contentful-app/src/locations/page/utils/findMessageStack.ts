import { AIAction } from "../../../ai/AIAction/AIAction";
import { AIMessage } from "../../../ai/AIAction/AIActionTypes";
import { MessageStackManager } from "../../../ai/MessageStackManager/MessageStackManager";
import { AIActionName } from "./findAIAction";

const messageStackLookup = new Map();

export default function findMessageStack(
  name: AIActionName,
  setMessageStack: React.Dispatch<React.SetStateAction<AIMessage[]>>,
  setAIAction: React.Dispatch<React.SetStateAction<AIAction | undefined>>
): MessageStackManager {
  if (!messageStackLookup.get(name)) {
    const newMessageStackManager = new MessageStackManager(
      setMessageStack,
      setAIAction
    );
    messageStackLookup.set(name, newMessageStackManager);
  }
  return messageStackLookup.get(name);
}

export function clearMessageStack(name: AIActionName) {
  messageStackLookup.delete(name);
}
