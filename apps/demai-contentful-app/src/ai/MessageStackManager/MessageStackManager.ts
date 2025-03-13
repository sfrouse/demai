import { AIMessage } from "../AIAction/AIActionTypes";

export class MessageStackManager {
  private conversationStack: AIMessage[] = [];
  private setMessageStack: React.Dispatch<React.SetStateAction<AIMessage[]>>;

  constructor(
    setMessageStack: React.Dispatch<React.SetStateAction<AIMessage[]>>
  ) {
    this.setMessageStack = setMessageStack;
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

  // Get the full conversation stack
  getMessages(): AIMessage[] {
    return this.conversationStack;
  }

  // Internal method to update React state
  private updateState() {
    this.setMessageStack([...this.conversationStack]); // Ensure state updates correctly
  }
}
