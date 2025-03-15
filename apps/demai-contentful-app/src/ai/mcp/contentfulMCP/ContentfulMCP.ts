import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { ChatCompletionTool } from "openai/resources/index.mjs";
import { createTransport } from "@smithery/sdk";
import { IMCPClient } from "../IMCPClient";

export class ContentfulMCP implements IMCPClient {
  private cma: string;
  private spaceId: string;
  private environmentId: string;

  constructor(cma: string, spaceId: string, environmentId: string) {
    this.cma = cma;
    this.spaceId = spaceId;
    this.environmentId = environmentId;
  }

  async connect() {
    const client = new Client({
      name: "DemAI",
      version: "1.0.0",
    });

    const transport = createTransport(
      "https://server.smithery.ai/@ivotoby/contentful-management-mcp-server",
      {
        managementToken: this.cma,
        host: "https://api.contentful.com",
        spaceId: this.spaceId, //: "vpwi3ymt2kis",
        environmentId: this.environmentId, // : "aitesting",
      }
    );

    await client.connect(transport);
    return client;
  }

  async getToolsForOpenAI(): Promise<ChatCompletionTool[]> {
    const client = await this.connect();
    const results = await client.listTools();
    return results.tools.map((tool: any) => ({
      type: "function",
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.inputSchema || { type: "object", properties: {} },
      },
    }));
  }

  async callFunction(toolName: string, params: any) {
    const client = await this.connect();
    return await client.callTool({ name: toolName, arguments: params });
  }
}
