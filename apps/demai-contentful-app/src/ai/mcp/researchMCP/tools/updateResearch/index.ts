import { IMCPTool } from "../../../MCPClient";
import updateResearchFunction from "./updateResearch.function";
import updateResearchTool, { UPDATE_RESEARCH } from "./updateResearch.tool";

const updateResearch: IMCPTool = {
  toolName: UPDATE_RESEARCH,
  tool: updateResearchTool,
  functionCall: updateResearchFunction,
};

export default updateResearch;
