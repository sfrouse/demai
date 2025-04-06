import { IMCPTool } from "../../MCPClient";
import createComponentDefinitionFunction from "../tools/createComponentDefinition/createComponentDefinition.function";
import createComponentDefinitionTool from "../tools/createComponentDefinition/createComponentDefinition.tool";

export const UPDATE_COMPONENT_DEFINITION_TOOL_NAME =
  "update_component_definition";

const updateComponentDefinition: IMCPTool = {
  toolName: UPDATE_COMPONENT_DEFINITION_TOOL_NAME,
  tool: {
    ...createComponentDefinitionTool,
    function: {
      ...createComponentDefinitionTool.function,
      name: UPDATE_COMPONENT_DEFINITION_TOOL_NAME,
      description:
        "Update a component definition that describes the interface for any kind of UI component such as a web component or Figma component. This is an update to an existing component definition.",
    },
  },
  // functionCall: createComponentDefinition.functionCall,
  functionCall: async (mcp, params) => {
    const entry = await createComponentDefinitionFunction(mcp, params);
    return {
      content: [
        {
          type: "object",
          text: entry,
        },
      ],
    };
  },
};

export default updateComponentDefinition;
