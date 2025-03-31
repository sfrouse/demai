import { ChatCompletionTool } from "openai/resources/index.mjs";
import { IMCPClient } from "../IMCPClient";
import saveColorSet, {
  SAVE_COLOR_SET_TOOL_NAME,
} from "./functions/saveColorSet";
import createComponentDefinition, {
  CREATE_COMPONENT_DEFINITION_TOOL_NAME,
} from "./functions/createComponentDefinition";
import createWebComponent, {
  CREATE_WEB_COMPONENT_TOOL_NAME,
} from "./functions/createWebComponent";
import createBinding, {
  CREATE_BINDING_TOOL_NAME,
} from "./functions/createBinding";
import { Tool } from "openai/resources/responses/responses.mjs";

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
              additionalProperties: false,
            },
            required: ["componentDefinition"],
          },
        },
      },
      saveColorSet.tool,
      createComponentDefinition.tool,
      createWebComponent.tool,
      createBinding.tool,
    ];
  }

  async getToolsForOpenAIResponses(): Promise<Tool[]> {
    const tools = await this.getToolsForOpenAI();
    return tools.map((tool) => ({
      name: tool.function.name,
      parameters: {
        ...tool.function.parameters,
      },
      description: tool.function.description,
      strict: true,
      type: "function",
    }));
  }

  async callFunction(toolName: string, params: any) {
    switch (toolName) {
      case SAVE_COLOR_SET_TOOL_NAME: {
        return saveColorSet.functionCall(this, params);
      }
      case CREATE_COMPONENT_DEFINITION_TOOL_NAME: {
        return createComponentDefinition.functionCall(this, params);
      }
      case CREATE_WEB_COMPONENT_TOOL_NAME: {
        return createWebComponent.functionCall(this, params);
      }
      case CREATE_BINDING_TOOL_NAME: {
        return createBinding.functionCall(this, params);
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
