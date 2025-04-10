import { IMCPTool } from "../../../MCPClient";
import updateComponentDefinitionFunction from "./updateComponentDefinition.function";
import updateComponentDefinitionTool, {
  UPDATE_COMPONENT_DEFINITION_TOOL_NAME,
} from "./updateComponentDefinition.tool";

const updateComponentDefinition: IMCPTool = {
  toolName: UPDATE_COMPONENT_DEFINITION_TOOL_NAME,
  tool: updateComponentDefinitionTool,
  functionCall: updateComponentDefinitionFunction,
};

export default updateComponentDefinition;
