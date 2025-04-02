import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { ChatCompletionTool } from "openai/resources/index.mjs";
import { createTransport } from "@smithery/sdk/transport.js";
import { MCPClient } from "../MCPClient";
import publishContentType from "./tools/publishContentType";
import createEntry from "./tools/createEntry";

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
    const tools = results.tools.map((tool: any) => {
      let finalTool = tool;
      if (tool.name === "publish_content_type") {
        finalTool = publishContentType.tool;
      }
      return {
        type: "function" as const,
        function: {
          name: finalTool.name,
          description: finalTool.description,
          parameters: finalTool.inputSchema || {
            type: "object",
            properties: {},
          },
        },
      };
    });
    console.log("tools", tools);
    return tools;
  }

  async callFunction(toolName: string, params: any): Promise<any> {
    console.log(`callFunction[${toolName}]`, params);
    if (toolName === "publish_content_type") {
      return publishContentType.function(
        this.cma,
        this.spaceId,
        this.environmentId,
        params
      );
    }
    if (toolName === "create_entry") {
      return createEntry.function(
        this.cma,
        this.spaceId,
        this.environmentId,
        params
      );
    }
    // if (toolName === "create_entry") {
    //   return;
    // }
    const client = await this.connect();
    return await client.callTool({ name: toolName, arguments: params });
  }
}
