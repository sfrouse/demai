import { COLOR_SET_ALLOW_LIST } from "../../../../../components/ContentPanel/Content/DSysTokensContent";
import { SAVE_COLOR_SET_TOOL_NAME } from "../../../../mcp/designSystemMCP/functions/saveColorSet";
import AIState from "../../../AIState";
import { AIPromptEngine } from "../../AIPromptEngine";
import * as icons from "@contentful/f36-icons";

export class ChangeTokenColorSetEngine extends AIPromptEngine {
  constructor(aiState: AIState) {
    super(aiState);

    this.system = {
      role: "system",
      content: `You are an expert in Design Systems and are helping guide a Solutions Engineer navigate customizing the colors on their website for a specific prospect.
        If you find that a tool would be useful, render that tool name in the output.
        Absolutely show the hex colors for each color you suggest on each prompt.
        Do not come up with any new names for color sets or colors.
        Use the user's prompeted color name each time.`,
    };
    this.toolType = "DemAIDesignSystem";
    this.toolFilters = [SAVE_COLOR_SET_TOOL_NAME];

    this.contextContent = () => [
      "Update",
      {
        id: "updateType",
        options: ["colorset", "core colorsets", "by color pattern"],
        defaultValue: "colorset",
        paths: [
          [
            {
              id: "colorSetList",
              options: COLOR_SET_ALLOW_LIST,
              defaultValue: "primary",
            },
            "color.",
          ],
          ["primary, secondary, and tertiary colors."],
          [
            {
              id: "colorPatterns",
              options: [
                "split compliment",
                "complimentary",
                "quadradic",
                "monochromatic",
                "analogous",
                "triadic",
              ],
              defaultValue: "split compliment",
            },
            "for primary, secondary, and tertiary colors.",
          ],
        ],
      },
    ];
    this.content = (aiState: AIState) =>
      `${aiState.userContent}. Please show the hex colors for each step and don't change any color names.`;

    this.introMessage =
      "Let's update some colors, what would you like to change?";

    this.executionPrompt = "Updating your colors...";
    this.placeholder =
      "Add the hex and any details about the color stepping...";

    this.prompts = {
      cancel: "Nope, Let's Rethink",
      run: "Yes, Let's Update",
      cancelIcon: icons.DeleteIcon,
      runIcon: icons.StarIcon,
    };
  }
}
