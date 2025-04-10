import { ChatCompletionTool } from "openai/resources/index.mjs";
import createComponentDefinition from "../createComponentDefinition";

export const UPDATE_COMPONENT_DEFINITION_TOOL_NAME =
  "update_component_definition";

const updateComponentDefinitionTool: ChatCompletionTool = {
  type: "function",
  function: {
    ...createComponentDefinition.tool.function,
    name: UPDATE_COMPONENT_DEFINITION_TOOL_NAME,
    description:
      "Update a component definition that describes the interface for any kind of UI component such as a web component or Figma component. This is an update to an existing component definition.",
  },
};

export default updateComponentDefinitionTool;
