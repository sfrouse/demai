import { IMCPTool } from "../../../MCPClient";
import updateBrandColorsFunction from "./updateBrandColors.function";
import udpateBrandColorsTool, {
  UPDATE_BRAND_COLORS,
} from "./updateBrandColors.tool";

const updateBrandColors: IMCPTool = {
  toolName: UPDATE_BRAND_COLORS,
  tool: udpateBrandColorsTool,
  functionCall: updateBrandColorsFunction,
};

export default updateBrandColors;
