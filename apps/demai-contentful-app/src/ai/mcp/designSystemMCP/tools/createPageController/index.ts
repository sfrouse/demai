import { IMCPTool } from "../../../MCPClient";
import createPageControllerFunction from "./createPageController.function";
import createPageControllerTool, {
    CREATE_PAGE_CONTROLLER,
} from "./createPageController.tool";

const createPageController: IMCPTool = {
    toolName: CREATE_PAGE_CONTROLLER,
    tool: createPageControllerTool,
    functionCall: createPageControllerFunction,
};

export default createPageController;
