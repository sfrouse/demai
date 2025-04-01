import { COLOR_SET_ALLOW_LIST } from "../../../../../components/ContentPanel/Content/DesignSystem/DSysTokensContent";
import { ContentState } from "../../../../../contexts/ContentStateContext/ContentStateContext";
import { SAVE_COLOR_SET_TOOL_NAME } from "../../../../mcp/designSystemMCP/functions/saveColorSet";
import AIState from "../../../AIState";
import rgbaToHex from "../../../utils/rgbaToHex";
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

    // CONTENT CONTEXT
    this.contextContent = () => [
      "Update",
      {
        id: "updateType",
        options: [
          "brand colors",
          "core colorsets",
          "specific colorset",
          "by color pattern",
        ],
        defaultValue: "brand colors",
        paths: [
          ["defined in research."],
          ["primary, secondary, and tertiary colors."],
          [
            {
              id: "colorSetList",
              options: COLOR_SET_ALLOW_LIST,
              defaultValue: "primary",
            },
            "color.",
          ],
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

    // CONTENT
    this.content = (aiState: AIState, contentState: ContentState) => {
      let extra = "";
      if (aiState.contextContentSelections["updateType"] === "brand colors") {
        extra = `
The brand colors are primary ${contentState.research?.fields.primaryColor}, secondary ${contentState.research?.fields.secondaryColor}, tertiary ${contentState.research?.fields.tertiaryColor}. `;
      }
      if (
        aiState.contextContentSelections["updateType"] === "specific colorset"
      ) {
        console.log("contentState.tokens", contentState.tokens);
        if (
          contentState.tokens?.color?.[
            aiState.contextContentSelections["colorSetList"]
          ]?.["500"]
        ) {
          extra = `
 The base color that you will be updating for this colorset now is ${rgbaToHex(
   contentState.tokens.color[aiState.contextContentSelections["colorSetList"]][
     "500"
   ]
 )}. `;
        }
      }
      return `${extra}${aiState.userContent}. Please show the hex colors for each step and don't change any color names.`;
    };

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
