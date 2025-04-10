import OpenAI from "openai";

import * as icons from "@contentful/f36-icons";

import { processContextContent } from "./AIPromptEngineRequest";
import {
  AIPromptConfig,
  AIPromptContentFunction,
  AIPromptContentPrefix,
  AIPromptContextContentSelections,
  AIPromptPrompts,
  AIPromptResponseContentFunction,
  AIPromptSystemPrompt,
  PromptExecuteResults,
  PromptRunResults,
} from "./AIPromptEngineTypes";
import { ContentState } from "../../contexts/ContentStateContext/ContentStateContext";
import {
  AIModels,
  OPEN_AI_MAX_TOKENS,
  OPEN_AI_TEMPERATURE,
  OPEN_AI_TOP_P,
} from "../openAI/openAIConfig";
import { ContentfulMCP } from "../mcp/contentfulMCP/ContentfulMCP";
import { DesignSystemMCPClient } from "../mcp/designSystemMCP/DesignSystemMCPClient";
import { ResearchMCP } from "../mcp/researchMCP/ResearchMCP";
import getOpeAIClient from "../openAI/getOpenAIClient";
import openAIChatCompletions, {
  OpenAIChatCompletionsProps,
} from "../openAI/openAIChatCompletions";
import { AppError } from "../../contexts/ErrorContext/ErrorContext";

export class AIPromptEngine {
  label: string = "Open Ended";

  // USER CONTENT
  contextContent: (contentState: ContentState) => AIPromptContentPrefix =
    () => [];
  content: AIPromptContentFunction = (userContent: string) => `${userContent}`;

  // AI SETUP
  system: AIPromptSystemPrompt = {
    role: "system",
    content:
      "You are an expert in Contentful, help this SE learn about Contentful demos.",
  };
  responseContent: AIPromptResponseContentFunction = (response: string) =>
    `${response}`;

  // UI CONTENT
  introMessage: string = "Let's do something";
  placeholder: string = "This is an open ended prompt...ask me anything.";
  prompts: AIPromptPrompts = {
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
  protected config: AIPromptConfig;

  constructor(config: AIPromptConfig) {
    this.config = config;
    this.openAIClient = getOpeAIClient(this.config.openAiApiKey);
    this.designSystemCMPClient = new DesignSystemMCPClient(
      this.config.cma,
      this.config.spaceId,
      this.config.environmentId,
      this.config.cpa
    );
    this.contentfulMCP = new ContentfulMCP(
      this.config.cma,
      this.config.spaceId,
      this.config.environmentId,
      this.config.cpa
    );
    this.researchMCP = new ResearchMCP(
      this.config.cma,
      this.config.spaceId,
      this.config.environmentId,
      this.config.cpa
    );
  }

  async runAndExec(
    request: string | undefined,
    contentState: ContentState,
    addError: (err: AppError) => void,
    chain: boolean = false
  ) {
    const runResults = await this.run(request, addError);
    if (runResults.success) {
      const response = this.responseContent(
        `${runResults.result}`,
        contentState
      );
      const runExeResults = await this.runExe(request, response, addError);
      return runExeResults;
    }
    return runResults;
  }

  async run(
    request: string | undefined,
    addError: (err: AppError) => void,
    chain: boolean = false
  ): Promise<PromptRunResults> {
    let aiArg: OpenAIChatCompletionsProps | undefined;
    try {
      // API CHAT COMPLETETIONS
      let tools = await this.getTools(this.toolFilters);
      aiArg = {
        model: this.model,
        openAIClient: this.openAIClient,
        systemPrompt: this.system,
        userPrompt: {
          role: "user",
          content: `${request}`,
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
      addError({
        service: "AI Service Run",
        showDialog: true,
        message: `AIPromptEngine:run (ToolType: ${this.toolType})`,
        details: `
Error: ${err}

Request: ${aiArg || "no aiArg"}
`,
      });
      return {
        success: false,
        errors: [`${err}`],
      };
    }
  }

  async runExe(
    request: string | undefined,
    response: string | undefined,
    addError: (err: AppError) => void,
    chain: boolean = true
  ): Promise<PromptExecuteResults> {
    // There are no tools in web search...
    if (this.toolType === "WebSearch") {
      return {
        success: true,
        result: "Ran web search",
        // errors: ["Web search engine has no tool features."],
        toolCalls: [],
        toolResults: [],
      };
    }

    let aiArg: OpenAIChatCompletionsProps | undefined;
    try {
      // API CHAT COMPLETETIONS
      let tools = await this.getTools(this.toolFilters);
      aiArg = {
        model: this.model,
        openAIClient: this.openAIClient,
        systemPrompt: this.system,
        userPrompt: {
          role: "user",
          content: `Please figure out a tool and all the appropriate properties that fulfills this: ${response}`,
        },
        prevMessages: [
          {
            role: "user",
            content: `${request}`,
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

      const toolResults: any[] = [];
      if (result.toolCalls) {
        for (const toolCallRaw of result.toolCalls) {
          const processedToolCall = this.preprocessToolRequest(
            toolCallRaw,
            addError
          );
          const mcpClient =
            this.toolType === "DemAIDesignSystem"
              ? this.designSystemCMPClient
              : this.toolType === "Research"
              ? this.researchMCP
              : this.contentfulMCP;

          try {
            // API CHAT COMPLETETIONS
            const exeResult = await mcpClient?.callFunction(
              processedToolCall.function.name,
              JSON.parse(processedToolCall.function.arguments)
            );
            toolResults.push(exeResult);
          } catch (err) {
            addError({
              service: "AI/MCP Tool Execution",
              message:
                "Something went wrong while trying to execute the tool in the MCP.",
              details: `
Tool: ${JSON.stringify(processedToolCall, null, 2)}
              
Error: ${err}
`,
            });
            return {
              success: false,
              errors: [`${err}`],
              toolCalls: [processedToolCall.function.name],
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
      let aiArgStr = "Failed to parse";
      try {
        aiArgStr = JSON.stringify(aiArgStr, null, 2);
      } catch (err) {}
      addError({
        service: "AI Service runExe",
        showDialog: true,
        message: `AIPromptEngine:runExe (ToolType: ${this.toolType})`,
        details: `
Error: ${err}

Request: ${aiArgStr}
`,
      });
      return {
        success: false,
        errors: [`${err}`],
        toolCalls: [],
        toolResults: [],
      };
    }
  }

  preprocessToolRequest(
    tool: OpenAI.Chat.Completions.ChatCompletionMessageToolCall,
    addError: (err: AppError) => void
  ): OpenAI.Chat.Completions.ChatCompletionMessageToolCall {
    return tool;
  }

  createRequest(
    userContent: string,
    contextContentSelections: AIPromptContextContentSelections,
    contentState: ContentState,
    ignoreContextContent: boolean = false
  ): string {
    if (ignoreContextContent) {
      return this.content
        ? this.content(userContent, contextContentSelections, contentState)
        : "";
    }
    const contextPrompt = processContextContent(
      this.contextContent(contentState),
      contextContentSelections
    );
    const content = this.content
      ? this.content(userContent, contextContentSelections, contentState)
      : "";

    return [...contextPrompt, content].join(" ");
  }

  getContextContentSelectionDefaults(
    contentState: ContentState,
    selections: AIPromptContextContentSelections = {},
    path?: AIPromptContentPrefix
  ) {
    const contentPrefixes = path || this.contextContent(contentState);
    contentPrefixes.forEach((item) => {
      if (typeof item === "string") {
        return; // Skip plain strings
      }

      // Store default value for the select item
      selections[item.id] = item.defaultValue;

      // Recursively process paths if they exist
      if (item.paths) {
        item.paths.forEach((path) => {
          this.getContextContentSelectionDefaults(
            contentState,
            selections,
            path
          );
        });
      }
    });

    return selections;
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
