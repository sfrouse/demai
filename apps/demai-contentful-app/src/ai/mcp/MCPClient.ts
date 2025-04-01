import { ChatCompletionTool } from "openai/resources/index.mjs";
import { DesignSystemMCPClient } from "./designSystemMCP/DesignSystemMCPClient";

export type IMCPClientValidation = {
  valid: boolean;
  details?: {
    [name: string]: {
      exists?: boolean;
      fieldsValid?: boolean;
      valid?: boolean;
    };
  };
};

export type IMCPTool = {
  toolName: string;
  tool: ChatCompletionTool;
  functionCall: (mcp: DesignSystemMCPClient, params: any) => any;
};

export class MCPClient {
  cma: string;
  spaceId: string;
  environmentId: string;
  cpa: string;

  constructor(
    cma: string,
    spaceId: string,
    environmentId: string,
    cpa: string
  ) {
    this.cma = cma;
    this.spaceId = spaceId;
    this.environmentId = environmentId;
    this.cpa = cpa;
  }

  async getToolsForOpenAI(): Promise<ChatCompletionTool[]> {
    return [];
  }

  async callFunction(toolName: string, params: any) {}

  async validate(): Promise<IMCPClientValidation> {
    return { valid: true };
  }

  // async getToolsForOpenAIResponses(): Promise<Tool[]> {
  //   const tools = await this.getToolsForOpenAI();
  //   return tools.map((tool) => ({
  //     name: tool.function.name,
  //     inputSchema: {
  //       type: "object",
  //       properties: {
  //         ...tool.function.parameters,
  //       },
  //     },
  //     description: tool.function.description,
  //   }));
  // }
}
