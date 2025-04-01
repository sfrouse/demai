import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { ChatCompletionTool } from "openai/resources/index.mjs";
import { createTransport } from "@smithery/sdk/transport.js";
import { MCPClient } from "../MCPClient";

export class ContentfulMCP extends MCPClient {
  async connect() {
    const transport = createTransport(
      "https://server.smithery.ai/@ivotoby/contentful-management-mcp-server",
      // "http://localhost:3000/",
      {
        managementToken: this.cma,
        host: "https://api.contentful.com",
        spaceId: this.spaceId,
        environmentId: this.environmentId,
      }
      // ""
    );
    const client = new Client({
      name: "DemAI",
      version: "1.0.0",
    });
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

  async callFunction(toolName: string, params: any): Promise<void> {
    const client = await this.connect();
    await client.callTool({ name: toolName, arguments: params });
  }
}
