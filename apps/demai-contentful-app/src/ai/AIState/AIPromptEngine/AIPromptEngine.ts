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
import { ResearchMCP } from "../../mcp/researchMCP/ResearchMCP";

export type PromptRunResults =
  | { success: true; result: string }
  | { success: false; errors: string[] };

export type PromptExecuteResults =
  | {
      success: true;
      result: string;
      toolCalls: string[];
      toolResults: any[];
    }
  | {
      success: false;
      errors: string[];
      toolCalls: string[];
      toolResults: any[];
    };

export class AIPromptEngine {
  label: string = "Open Ended";

  // USER CONTENT
  contextContent: (contentState: ContentState) => AIStateContentPrefix =
    () => [];
  content: AIStateContent = (aiState: AIState) => `${aiState.userContent}`;

  // AI SETUP
  system: AIStateSystemPrompt = {
    role: "system",
    content:
      "You are an expert in Contentful, help this SE learn about Contentful demos.",
  };
  responseContent: AIStateResponseContent = (response: string) => `${response}`;

  // UI CONTENT
  introMessage: string = "Let's do something";
  placeholder: string = "This is an open ended prompt...ask me anything.";
  prompts: AIStatePrompts = {
    cancel: "Nope, Let's Rethink",
    run: "Yes, Create This",
    cancelIcon: icons.DeleteIcon,
    runIcon: icons.StarIcon,
  };
  executionPrompt: string | undefined;

  // AI CLIENTS
  protected model: AIModels = AIModels.gpt4o;
  private openAIClient: OpenAI;

  // TOOL CONFIG
  toolType:
    | "DemAIDesignSystem"
    | "Contentful"
    | "WebSearch"
    | "Research"
    | "none" = "none";
  toolFilters: string[] = [];
  // -- MCPs
  private contentfulMCP: ContentfulMCP | undefined;
  private designSystemCMPClient: DesignSystemMCPClient | undefined;
  private researchMCP: ResearchMCP | undefined;

  constructor(aiState: AIState) {
    this.openAIClient = getOpeAIClient(aiState.config.openAiApiKey);
    this.designSystemCMPClient = new DesignSystemMCPClient(
      aiState.config.cma,
      aiState.config.spaceId,
      aiState.config.environmentId,
      aiState.config.cpa
    );
    this.contentfulMCP = new ContentfulMCP(
      aiState.config.cma,
      aiState.config.spaceId,
      aiState.config.environmentId,
      aiState.config.cpa
    );
    this.researchMCP = new ResearchMCP(
      aiState.config.cma,
      aiState.config.spaceId,
      aiState.config.environmentId,
      aiState.config.cpa
    );
  }

  async run(
    aiState: AIState,
    chain: boolean = false
  ): Promise<PromptRunResults> {
    try {
      // const prevState = aiState.getStateHistory();

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
        // prevMessages: prevState,
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
      console.log(`run[start][${this.toolType}]:`, aiArg);
      const result = await openAIChatCompletions(aiArg);
      console.log(`run[end][${this.toolType}]:`, result);

      return {
        success: true,
        result: `${result.description}`,
      };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        errors: [`${err}`],
      };
    }
  }

  async runExe(
    aiState: AIState,
    chain: boolean = true
  ): Promise<PromptExecuteResults> {
    // There are no tools in web search...
    if (this.toolType === "WebSearch") {
      return {
        success: false,
        errors: ["Web search engine has no tool features."],

        toolCalls: [],
        toolResults: [],
      };
    }

    try {
      // const prevState = aiState.getStateHistory();

      // API CHAT COMPLETETIONS
      let tools = await this.getTools(this.toolFilters);
      let aiArg: OpenAIChatCompletionsProps = {
        model: this.model,
        openAIClient: this.openAIClient,
        systemPrompt: this.system,
        userPrompt: {
          role: "user",
          content: `Please figure out a tool and all the appropriate properties that fulfills this: ${aiState.response}`,
        },
        prevMessages: [
          {
            role: "user",
            content: `${aiState.request}`,
          },
        ],
        // prevMessages: prevState,
        max_tokens: OPEN_AI_MAX_TOKENS,
      };

      // TOOL DECISIONS
      aiArg = {
        ...aiArg,
        top_p: OPEN_AI_TOP_P,
        temperature: OPEN_AI_TEMPERATURE,
        tools,
        tool_choice: tools ? "required" : undefined,
      };

      // RUN
      console.log(`runExe[start][${this.toolType}]:`, aiArg);
      const result = await openAIChatCompletions(aiArg);
      console.log(`runExe[end][${this.toolType}]:`, result);

      const toolResults = [];
      if (result.toolCalls) {
        for (const toolCall of result.toolCalls) {
          const mcpClient =
            this.toolType === "DemAIDesignSystem"
              ? this.designSystemCMPClient
              : this.toolType === "Research"
              ? this.researchMCP
              : this.contentfulMCP;

          try {
            // API CHAT COMPLETETIONS
            const exeResult = await mcpClient?.callFunction(
              toolCall.function.name,
              JSON.parse(toolCall.function.arguments)
            );
            toolResults.push(exeResult);
          } catch (err) {
            return {
              success: false,
              errors: [`${err}`],
              toolCalls: [toolCall.function.name],
              toolResults: [],
            };
          }
        }
      }
      return {
        success: true,
        result: `${
          result.toolCalls
            ? result.toolCalls
                .map((toolCall) => toolCall.function.name)
                .join(", ")
            : "no tools called"
        }`,
        toolCalls: result.toolCalls
          ? result.toolCalls.map((toolCall) => toolCall.function.name)
          : [],
        toolResults,
      };
    } catch (err) {
      console.error("AIPromptEngine: ", err);
      return {
        success: false,
        errors: [`${err}`],
        toolCalls: [],
        toolResults: [],
      };
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
      case "Research": {
        tools = await this.researchMCP!.getToolsForOpenAI();
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
}

// function processExeResults() {}
