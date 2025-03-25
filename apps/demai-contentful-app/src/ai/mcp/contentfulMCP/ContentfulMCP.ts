import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { ChatCompletionTool } from "openai/resources/index.mjs";
import { createTransport } from "@smithery/sdk";
import { IMCPClient } from "../IMCPClient";
import { Tool } from "openai/resources/responses/responses.mjs";

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
    const transport = createTransport(
      "https://server.smithery.ai/@ivotoby/contentful-management-mcp-server",
      // "http://localhost:3000/",
      {
        managementToken: this.cma,
        host: "https://api.contentful.com",
        spaceId: this.spaceId,
        environmentId: this.environmentId,
      }
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

  async getToolsForOpenAIResponses(): Promise<Tool[]> {
    const client = await this.connect();
    const results = await client.listTools();

    const cleanSchema = (schema: any): any => {
      if (!schema || typeof schema !== "object") return schema;

      // Remove invalid properties
      const {
        default: _default,
        maximum: _maximum,
        minimum: _minimum,
        pattern: _pattern,
        ...filteredSchema
      } = schema;

      if (filteredSchema.properties) {
        return {
          ...filteredSchema,
          properties: Object.fromEntries(
            Object.entries(filteredSchema.properties).map(([key, value]) => [
              key,
              cleanSchema(value),
            ])
          ),
          required: Object.keys(filteredSchema.properties),
          additionalProperties: false,
        };
      } else if (filteredSchema.type === "object") {
        return {
          ...filteredSchema,
          additionalProperties: true,
          // required: [],
        };
      }

      return filteredSchema;
    };

    return results.tools.map((tool: any) => ({
      type: "function",
      strict: false, // true,
      name: tool.name,
      description: tool.description,
      parameters: cleanSchema(tool.inputSchema),
    }));
  }

  async callFunction(toolName: string, params: any) {
    const client = await this.connect();
    return await client.callTool({ name: toolName, arguments: params });
    // return await client.callTool(toolName, params);
  }
}
