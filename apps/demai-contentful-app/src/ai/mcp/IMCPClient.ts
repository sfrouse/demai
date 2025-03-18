import { ChatCompletionTool } from "openai/resources/index.mjs";
import { DesignSystemMCPClient } from "./designSystemMCP/DesignSystemMCPClient";

export interface IMCPClient {
  getToolsForOpenAI(): Promise<ChatCompletionTool[]>;
  callFunction(toolName: string, params: any): Promise<any>;
}

export type IMCPTool = {
  toolName: string;
  tool: ChatCompletionTool;
  functionCall: (mcp: DesignSystemMCPClient, params: any) => any;
};
