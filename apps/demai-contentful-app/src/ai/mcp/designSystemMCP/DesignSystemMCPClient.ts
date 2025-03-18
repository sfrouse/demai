import { ChatCompletionTool } from "openai/resources/index.mjs";
import { IMCPClient } from "../IMCPClient";
// import ensureDemAITokensContentType from "./utils/ensureDemAITokensContentType";
// import ensureDemAIComponentsContentType from "./utils/ensureDemAIComponentContentType";
// import ensureDemAITokensSingletonEntry from "./utils/ensureDemAITokensSingletonEntry";
import transformTokens from "demai-design-system-core/src/tokens/scripts/transformTokens";
import updateColorSetInTokens from "./utils/tokens/updateColorSetInTokens";
import getLatestTokens from "./utils/getLatestTokens";
import { DEMAI_TOKENS_SINGLETON_ENTRY_ID } from "./contentTypes/demaiTokensCType";
import { updateDemAITokensEntry } from "./contentTypes/tokenSingleton/updateDemAITokensEntry";

export class DesignSystemMCPClient implements IMCPClient {
  private cma: string;
  private spaceId: string;
  private environmentId: string;

  constructor(cma: string, spaceId: string, environmentId: string) {
    this.cma = cma;
    this.spaceId = spaceId;
    this.environmentId = environmentId;
  }

  async getToolsForOpenAI(): Promise<ChatCompletionTool[]> {
    return [
      {
        type: "function",
        function: {
          name: "create_component",
          description:
            "Creates an entry that saves a component definition and code for a web component.",
          parameters: {
            type: "object",
            properties: {
              componentDefinition: {
                description:
                  "A specifically formatted JSON file describint the interface of a UI Component",
                type: "string",
              },
              componentCode: {
                description:
                  "The actual javascript that instantiates an HTML5 web component.",
                type: "string",
              },
            },
            required: ["componentDefinition"],
          },
        },
      },
      // TODO: auto generate...
      {
        type: "function",
        function: {
          name: "save_color_set",
          description:
            "Stores a structured color set with semantic naming (e.g., ‘primary’) and progressive shades from darkest (100) to lightest (975) for consistent theming. Make sure to describe all the colors when asked.",
          parameters: {
            type: "object",
            properties: {
              name: {
                description:
                  "A meaningful name that describes how to apply the color, e.g., 'primary', 'secondary'. Avoid direct color references.",
                type: "string",
              },
              "100": {
                description: "The darkest color in the set, just above black.",
                type: "string",
              },
              "200": {
                description:
                  "A deep dark shade, lighter than 100 but still rich.",
                type: "string",
              },
              "300": {
                description: "A dark neutral shade for contrast.",
                type: "string",
              },
              "400": {
                description: "A slightly desaturated deep color for accents.",
                type: "string",
              },
              "500": {
                description: "The base color, the most commonly used shade.",
                type: "string",
              },
              "600": {
                description: "A slightly lighter variant of the base color.",
                type: "string",
              },
              "700": {
                description: "A mid-light version for subtle highlights.",
                type: "string",
              },
              "800": {
                description: "A soft pastel or tint-like version of the base.",
                type: "string",
              },
              "900": {
                description: "A very light version, nearing white.",
                type: "string",
              },
              "950": {
                description: "A near-white shade with a slight color hint.",
                type: "string",
              },
              "975": {
                description: "Almost completely white, but not pure.",
                type: "string",
              },
            },
            required: [
              "name",
              "100",
              "200",
              "300",
              "400",
              "500",
              "600",
              "700",
              "800",
              "900",
              "950",
              "975",
            ],
          },
        },
      },
    ];
  }

  async callFunction(toolName: string, params: any) {
    switch (toolName) {
      case "save_color_set": {
        const tokens = await getLatestTokens(
          this.cma,
          this.spaceId,
          this.environmentId
        );
        const newTokens = updateColorSetInTokens(tokens, params.name, {
          ...params,
          name: undefined,
        });
        const tokenCode = await transformTokens(newTokens, "dmai", "../");

        let jsonTokens = {};
        try {
          jsonTokens = JSON.parse(
            tokenCode?.find((code: any) => code.name === "json")?.content
          );
        } catch {}

        let jsonNestedTokens = {};
        try {
          jsonNestedTokens = JSON.parse(
            tokenCode?.find((code: any) => code.name === "jsonNested")?.content
          );
        } catch {}

        const entry = await updateDemAITokensEntry(
          this.cma,
          this.spaceId,
          this.environmentId,
          DEMAI_TOKENS_SINGLETON_ENTRY_ID,
          {
            // title: params.name, // don't change...
            source: newTokens,
            json: jsonTokens,
            jsonNested: jsonNestedTokens,
            css: tokenCode?.find((code: any) => code.name === "css")?.content,
            scss: tokenCode?.find((code: any) => code.name === "scss")?.content,
            contentfulTokens: tokenCode?.find(
              (code: any) => code.name === "contentful"
            )?.content,
          }
        );

        return {
          content: [
            {
              type: "object",
              text: entry,
            },
          ],
        };
      }
      default: {
        return {
          content: [
            {
              type: "text",
              text: `Error: Unknown tool: ${toolName}`,
            },
          ],
          isError: true,
        };
      }
    }
  }
}
