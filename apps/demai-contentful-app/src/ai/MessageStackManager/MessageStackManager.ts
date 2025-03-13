import { AIAction } from "../AIAction/AIAction";
import { AIMessage } from "../AIAction/AIActionTypes";

export class MessageStackManager {
  private conversationStack: AIMessage[] = [];
  private setMessageStack: React.Dispatch<React.SetStateAction<AIMessage[]>>;
  private _setAIAction: React.Dispatch<
    React.SetStateAction<AIAction | undefined>
  >;

  constructor(
    setMessageStack: React.Dispatch<React.SetStateAction<AIMessage[]>>,
    setAIAction: React.Dispatch<React.SetStateAction<AIAction | undefined>>
  ) {
    this.setMessageStack = setMessageStack;
    this._setAIAction = setAIAction;
  }

  initialize() {
    this.updateState();
  }

  // Add a new message to the stack
  addMessage(message: AIMessage) {
    this.conversationStack.push(message);
    this.updateState();
  }

  // Remove the last message (undo functionality)
  removeLastMessage() {
    this.conversationStack.pop();
    this.updateState();
  }

  // Reset the conversation
  resetMessages() {
    this.conversationStack = [];
    this.updateState();
  }

  setAIAction(aiAction: AIAction) {
    this._setAIAction(aiAction);
    this.updateState();
  }

  // Get the full conversation stack
  getMessages(): AIMessage[] {
    return this.conversationStack;
  }

  getLastMessage(): AIMessage | undefined {
    if (this.conversationStack.length === 0) return;
    return this.conversationStack[this.conversationStack.length - 1];
  }

  isEmpty(): boolean {
    return this.conversationStack.length === 0;
  }

  // Internal method to update React state
  private updateState() {
    this.setMessageStack([...this.conversationStack]); // Ensure state updates correctly
  }
}
