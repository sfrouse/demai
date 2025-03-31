import OpenAI from "openai";
import {
  AIModels,
  OPEN_AI_MAX_TOKENS,
  OPEN_AI_TEMPERATURE,
  OPEN_AI_TOP_P,
} from "../../openAI/openAIConfig";
import AIState from "../AIState";
import {
  AIStateContent,
  AIStateContentPrefix,
  AIStatePrompts,
  AIStateResponseContent,
  AIStateSystemPrompt,
} from "../AIStateTypes";
import * as icons from "@contentful/f36-icons";
import { DesignSystemMCPClient } from "../../mcp/designSystemMCP/DesignSystemMCPClient";
import { ContentfulMCP } from "../../mcp/contentfulMCP/ContentfulMCP";
import getOpeAIClient from "../../openAI/getOpenAIClient";
import { ContentState } from "../../../contexts/ContentStateContext/ContentStateContext";
import openAIChatCompletions, {
  OpenAIChatCompletionsProps,
} from "../../openAI/openAIChatCompletions";

export class AIPromptEngine {
  label: string = "Open Ended";
  introMessage: string = "Let's do something";
  contextContent: (contentState: ContentState) => AIStateContentPrefix =
    () => [];
  content: AIStateContent = (aiState: AIState) => `${aiState.userContent}`;
  responseContent: AIStateResponseContent = (response: string) => `${response}`;
  placeholder: string =
    "This is an open ended prompt that uses tools...ask me something about Contentful.";
  prompts: AIStatePrompts = {
    cancel: "Nope, Let's Rethink",
    run: "Yes, Let's Do This",
    cancelIcon: icons.DeleteIcon,
    runIcon: icons.StarIcon,
  };
  executionPrompt: string | undefined;

  toolType: "DemAIDesignSystem" | "Contentful" | "WebSearch" | "none" = "none";
  toolFilters: string[] = [];
  protected model: AIModels = AIModels.gpt4o;
  system: AIStateSystemPrompt = {
    role: "system",
    content:
      "You are an expert in Contentful, help this SE learn about Contentful demos.",
  };
  private openAIClient: OpenAI;
  private contentfulMCP: ContentfulMCP | undefined;
  private designSystemCMPClient: DesignSystemMCPClient | undefined;

  // Daisy Chaining
  protected runNextEngine = async () => {
    return null;
  };
  protected executeNextEngine = async () => {
    return null;
  };

  constructor(aiState: AIState) {
    this.openAIClient = getOpeAIClient(aiState.config.openAiApiKey);
    this.designSystemCMPClient = new DesignSystemMCPClient(
      aiState.config.cma,
      aiState.config.spaceId,
      aiState.config.environmentId
    );
    this.contentfulMCP = new ContentfulMCP(
      aiState.config.cma,
      aiState.config.spaceId,
      aiState.config.environmentId
    );
  }

  async run(aiState: AIState, chain: boolean = false) {
    try {
      const prevState = aiState.getStateHistory();

      // API CHAT COMPLETETIONS
      let tools = await this.getTools(this.toolFilters);
      let aiArg: OpenAIChatCompletionsProps = {
        model: this.model,
        openAIClient: this.openAIClient,
        systemPrompt: this.system,
        userPrompt: {
          role: "user",
          content: `${aiState.request}`,
        },
        prevMessages: prevState,
        max_tokens: OPEN_AI_MAX_TOKENS,
      };
      if (this.toolType !== "WebSearch") {
        aiArg = {
          ...aiArg,
          top_p: OPEN_AI_TOP_P,
          temperature: OPEN_AI_TEMPERATURE,
          tools,
          tool_choice: tools ? "none" : undefined,
        };
      } else {
        aiArg = {
          ...aiArg,
          web_search_options: {},
        };
      }

      // RUN
      console.log("run[start]:", aiArg);
      const result = await openAIChatCompletions(aiArg);
      console.log("run[end]:", result);

      return result.description;
    } catch (err) {
      console.error(err);
      return "Error";
    }
  }

  async runExe(aiState: AIState): Promise<string[] | undefined> {
    try {
      const prevState = aiState.getStateHistory();

      // API CHAT COMPLETETIONS
      let tools = await this.getTools(this.toolFilters);
      let aiArg: OpenAIChatCompletionsProps = {
        model: this.model,
        openAIClient: this.openAIClient,
        systemPrompt: this.system,
        userPrompt: {
          role: "assistant",
          content: `${aiState.response}`,
        },
        prevMessages: prevState,
        max_tokens: OPEN_AI_MAX_TOKENS,
      };
      if (this.toolType !== "WebSearch") {
        aiArg = {
          ...aiArg,
          top_p: OPEN_AI_TOP_P,
          temperature: OPEN_AI_TEMPERATURE,
          tools,
          tool_choice: tools ? "required" : undefined,
        };
      } else {
        aiArg = {
          ...aiArg,
          web_search_options: {},
        };
      }

      // RUN
      console.log("runExe[start]:", aiArg);
      const result = await openAIChatCompletions(aiArg);
      console.log("runExe[end]:", result);

      if (result.toolCalls) {
        for (const toolCall of result.toolCalls) {
          const mcpClient =
            this.toolType === "DemAIDesignSystem"
              ? this.designSystemCMPClient
              : this.contentfulMCP;

          // API CHAT COMPLETETIONS
          const exeResult = await mcpClient?.callFunction(
            toolCall.function.name,
            JSON.parse(toolCall.function.arguments)
          );
          console.log("AIPromptEngin toolCall, exeResult", toolCall, exeResult);

          if (exeResult?.isError === true) {
            return exeResult.content &&
              Array.isArray(exeResult.content) &&
              exeResult.content.length > 0
              ? exeResult.content[0].text
              : ["error"];
          }
        }
      }
      return result.toolCalls
        ? result.toolCalls.map((toolCall) => toolCall.function.name)
        : [];
    } catch (err) {
      console.error("AIPromptEngine: ", err);
      return;
    }
  }

  async getTools(toolFilters?: string[]) {
    let tools;
    switch (this.toolType) {
      case "DemAIDesignSystem": {
        tools = await this.designSystemCMPClient!.getToolsForOpenAI();
        break;
      }
      case "Contentful": {
        tools = await this.contentfulMCP!.getToolsForOpenAI();
        break;
      }
      case "WebSearch": {
        break;
      }
    }

    if (tools && toolFilters && toolFilters.length > 0) {
      tools = tools.filter((tool) =>
        tool.type === "function" &&
        this.toolFilters.includes(tool.function.name)
          ? true
          : false
      );
    }
    return tools;
  }

  // async getToolsForResponses(toolFilters?: string[]) {
  //   let tools;
  //   if (this.toolType === "DemAIDesignSystem") {
  //     tools = await this.designSystemCMPClient!.getToolsForOpenAIResponses();
  //   } else {
  //     tools = await this.contentfulMCP!.getToolsForOpenAIResponses();
  //   }

  //   if (toolFilters && toolFilters.length > 0) {
  //     tools = tools.filter((tool) =>
  //       tool.type === "function" && this.toolFilters.includes(tool.name)
  //         ? true
  //         : false
  //     );
  //   }
  //   return tools;
  // }
}
