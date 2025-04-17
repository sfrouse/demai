import { COLOR_SET_ALLOW_LIST } from "../../../../components/ContentPanel/Content/DesignSystem/DSysTokensContent";
import { ContentState } from "../../../../contexts/ContentStateContext/ContentStateContext";
import { SAVE_COLOR_SET_TOOL_NAME } from "../../../mcp/designSystemMCP/functions/saveColorSet";
import { AIAction } from "../../AIAction";
import { AIActionConfig, AIActionSnapshot } from "../../AIActionTypes";
import rgbaToHex from "../../utils/rgbaToHex";

export class ChangeTokenColorSetAction extends AIAction {
    static label = "Update Color Tokens";

    async loadNeededData() {
        await this.loadProperty("tokens");
        await this.loadProperty("research");
    }

    async postExeDataUpdates(): Promise<void> {
        await this.loadProperty("tokens");
    }

    constructor(
        config: AIActionConfig,
        getContentState: () => ContentState,
        loadProperty: (key: keyof ContentState, forceRefresh?: boolean) => void,
        snapshotOverrides?: Partial<AIActionSnapshot>,
    ) {
        super(config, getContentState, loadProperty, snapshotOverrides);

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
        this.content = (contentState: ContentState) => {
            let extra = "";
            if (
                this.contextContentSelections["updateType"] === "brand colors"
            ) {
                extra = `
The brand colors are primary ${contentState.research?.fields.primaryColor}, secondary ${contentState.research?.fields.secondaryColor}, tertiary ${contentState.research?.fields.tertiaryColor}. `;
            }
            if (
                this.contextContentSelections["updateType"] ===
                "specific colorset"
            ) {
                if (
                    contentState.tokens?.color?.[
                        this.contextContentSelections["colorSetList"]
                    ]?.["500"]
                ) {
                    extra = `
 The base color that you will be updating for this colorset now is ${rgbaToHex(
     contentState.tokens.color[this.contextContentSelections["colorSetList"]][
         "500"
     ],
 )}. `;
                }
            }
            return `${extra}${this.userContent}. Please show the hex colors for each step and don't change any color names.`;
        };

        this.introMessage =
            "Let's update some colors, what would you like to change?";

        this.executionPrompt = "Updating your colors...";
        this.placeholder =
            "Add the hex and any details about the color stepping...";
    }
}
