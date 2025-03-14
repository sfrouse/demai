import { ChatCompletionTool } from "openai/resources/index.mjs";

export interface IMCPClient {
  getToolsForOpenAI(): Promise<ChatCompletionTool[]>;
  callFunction(toolName: string, params: any): Promise<any>;
}
