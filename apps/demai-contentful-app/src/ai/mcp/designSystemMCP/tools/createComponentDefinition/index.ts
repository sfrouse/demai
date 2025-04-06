import { IMCPTool } from "../../../MCPClient";
import createComponentDefinitionFunction from "./createComponentDefinition.function";
import createComponentDefinitionTool, {
  CREATE_COMPONENT_DEFINITION_TOOL_NAME,
} from "./createComponentDefinition.tool";

const createComponentDefinition: IMCPTool = {
  toolName: CREATE_COMPONENT_DEFINITION_TOOL_NAME,
  tool: createComponentDefinitionTool,
  functionCall: createComponentDefinitionFunction,
};

export default createComponentDefinition;
