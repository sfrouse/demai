import { ChatCompletionTool } from "openai/resources/index.mjs";
import { IMCPClientValidation, MCPClient } from "../MCPClient";
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
import validateDesignSystemMCP from "./validate/validateDesignSystemMCP";

export class DesignSystemMCPClient extends MCPClient {
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

  async validate(): Promise<IMCPClientValidation> {
    const validationResult = await validateDesignSystemMCP(
      this.cma,
      this.spaceId,
      this.environmentId
    );
    return validationResult;
  }
}
