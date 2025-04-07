import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { ChatCompletionTool } from "openai/resources/index.mjs";
import { createTransport } from "@smithery/sdk/transport.js";
import { MCPClient } from "../MCPClient";
import publishContentType from "./tools/publishContentType";
import createEntry from "./tools/createEntry";
import createContentType from "./tools/createContentType";
import { CREATE_CONTENT_TYPE } from "./tools/createContentType/createContentType.tool";
import { PUBLISH_CONTENT_TYPE } from "./tools/publishContentType/publishContentType.tool";
import { CREATE_ENTRY } from "./tools/createEntry/createEntry.tool";

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
      switch (tool.name) {
        case PUBLISH_CONTENT_TYPE: {
          finalTool = publishContentType.tool;
          break;
        }
        case CREATE_ENTRY: {
          finalTool = createEntry.tool;
          break;
        }
        case CREATE_CONTENT_TYPE: {
          finalTool = createContentType.tool;
          break;
        }
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
    switch (toolName) {
      case CREATE_ENTRY: {
        return createEntry.function(
          this.cma,
          this.spaceId,
          this.environmentId,
          params
        );
      }
      case PUBLISH_CONTENT_TYPE: {
        return publishContentType.function(
          this.cma,
          this.spaceId,
          this.environmentId,
          params
        );
      }
      case CREATE_CONTENT_TYPE: {
        return createContentType.function(
          this.cma,
          this.spaceId,
          this.environmentId,
          params
        );
      }
    }

    const client = await this.connect();
    return await client.callTool({ name: toolName, arguments: params });
  }
}
