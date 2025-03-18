import { ChatCompletionTool } from "openai/resources/index.mjs";
import { IMCPClient } from "../IMCPClient";
import saveColorSet from "./functions/saveColorSet";
import createComponentDefinition from "./functions/createComponentDefinition";
import createWebComponent from "./functions/createWebComponent";

export class DesignSystemMCPClient implements IMCPClient {
  cma: string;
  spaceId: string;
  environmentId: string;

  constructor(cma: string, spaceId: string, environmentId: string) {
    this.cma = cma;
    this.spaceId = spaceId;
    this.environmentId = environmentId;
  }

  async getToolsForOpenAI(): Promise<ChatCompletionTool[]> {
    return [
      {
        type: "function",
        function: {
          name: "create_component",
          description:
            "Creates an entry that saves a component definition and code for a web component.",
          parameters: {
            type: "object",
            properties: {
              componentDefinition: {
                description:
                  "A specifically formatted JSON file describint the interface of a UI Component",
                type: "string",
              },
              componentCode: {
                description:
                  "The actual javascript that instantiates an HTML5 web component.",
                type: "string",
              },
            },
            required: ["componentDefinition"],
          },
        },
      },
      saveColorSet.tool,
      createComponentDefinition.tool,
      createWebComponent.tool,
    ];
  }

  async callFunction(toolName: string, params: any) {
    switch (toolName) {
      case saveColorSet.toolName: {
        return saveColorSet.functionCall(this, params);
      }
      case createComponentDefinition.toolName: {
        return createComponentDefinition.functionCall(this, params);
      }
      case createWebComponent.toolName: {
        return createWebComponent.functionCall(this, params);
      }
      default: {
        return {
          content: [
            {
              type: "text",
              text: `Error: Unknown tool: ${toolName}`,
            },
          ],
          isError: true,
        };
      }
    }
  }
}
