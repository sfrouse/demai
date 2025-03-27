import OpenAI from "openai";
import { AIModels } from "../../openAI/openAIConfig";
import AIState from "../AIState";
import {
  AIStateContent,
  AIStateContentPrefix,
  AIStatePrompts,
  AIStateSystemPrompt,
} from "../AIStateTypes";
import * as icons from "@contentful/f36-icons";
import { DesignSystemMCPClient } from "../../mcp/designSystemMCP/DesignSystemMCPClient";
import { ContentfulMCP } from "../../mcp/contentfulMCP/ContentfulMCP";
import getOpeAIClient from "../../openAI/getOpenAIClient";
import { ContentState } from "../../../contexts/ContentStateContext/ContentStateContext";
import openAIResponses from "../../openAI/openAIResponses";

export class AIPromptEngine {
  label: string = "Open Ended";
  introMessage: string = "Let's do something";
  contextContent: (contentState: ContentState) => AIStateContentPrefix =
    () => [];
  content: AIStateContent = (aiState: AIState, contentState: ContentState) =>
    `${aiState.userContent}`;
  placeholder: string =
    "This is an open ended prompt that uses tools...ask me something about Contentful.";
  prompts: AIStatePrompts = {
    cancel: "Nope, Let's Rethink",
    run: "Yes, Let's Do This",
    cancelIcon: icons.DeleteIcon,
    runIcon: icons.StarIcon,
  };
  executionPrompt: string | undefined;

  toolType: "DemAIDesignSystem" | "Contentful" | "none" = "none";
  toolFilters: string[] = [];
  protected model: AIModels = AIModels.gpt4o;
  protected system: AIStateSystemPrompt = {
    role: "system",
    content:
      "You are an expert in Contentful, help this SE learn about Contentful demos.",
  };
  private aiState: WeakRef<AIState>;
  private openAIClient: OpenAI;
  private contentfulMCP: ContentfulMCP | undefined;
  private designSystemCMPClient: DesignSystemMCPClient | undefined;

  constructor(aiState: AIState) {
    this.aiState = new WeakRef(aiState);
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

  async run(contentState: ContentState) {
    const aiState = this.aiState.deref()!;
    try {
      let tools = await this.getToolsForResponses();
      if (this.toolFilters && this.toolFilters.length > 0) {
        tools = tools.filter((tool) =>
          tool.type === "function" && this.toolFilters.includes(tool.name)
            ? true
            : false
        );
      }
      const prevState = aiState.getStateHistory();
      // const result = await openAIChatCompletions({
      //   openAIClient: this.openAIClient,
      //   systemPrompt: this.system,
      //   userPrompt: {
      //     role: "user",
      //     content: aiState.createPrompt(contentState),
      //   },
      //   prevMessages: prevState,
      //   tools,
      //   tool_choice: "none",
      // });
      const result = await openAIResponses({
        openAIClient: this.openAIClient,
        systemPrompt: this.system,
        userPrompt: {
          role: "user",
          content: aiState.createPrompt(contentState),
        },
        prevMessages: prevState,
        tools,
        tool_choice: "none",
      });
      console.log("run:", result);

      return result.description;
    } catch (err) {
      console.error(err);
      return "Error";
    }
  }

  async runExe(): Promise<string[] | undefined> {
    const aiState = this.aiState.deref()!;

    try {
      let tools = await this.getToolsForResponses();
      if (this.toolFilters && this.toolFilters.length > 0) {
        tools = tools.filter((tool) =>
          tool.type === "function" && this.toolFilters.includes(tool.name)
            ? true
            : false
        );
      }

      // const result = await openAIChatCompletions({
      //   openAIClient: this.openAIClient,
      //   systemPrompt: this.system,
      //   userPrompt: {
      //     role: "assistant",
      //     content: aiState.response,
      //   },
      //   tools,
      //   tool_choice: "required",
      // });

      const result = await openAIResponses({
        openAIClient: this.openAIClient,
        systemPrompt: this.system,
        userPrompt: {
          role: "assistant",
          content: aiState.response,
        },
        tools,
        tool_choice: "required",
      });
      console.log("runExe:", result);

      if (result.toolCalls) {
        for (const toolCall of result.toolCalls) {
          const mcpClient =
            this.toolType === "DemAIDesignSystem"
              ? this.designSystemCMPClient
              : this.contentfulMCP;

          const exeResult = await mcpClient?.callFunction(
            toolCall.name,
            JSON.parse(toolCall.arguments)
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

      return []; // result.toolCalls?.map((tool) => tool.function.name);
    } catch (err) {
      console.error("AIPromptEngine: ", err);
      return;
    }
  }

  async getTools() {
    if (this.toolType === "DemAIDesignSystem") {
      return await this.designSystemCMPClient!.getToolsForOpenAI();
    } else {
      const tools = await this.contentfulMCP!.getToolsForOpenAI();
      return tools;
    }
  }

  async getToolsForResponses() {
    if (this.toolType === "DemAIDesignSystem") {
      return await this.designSystemCMPClient!.getToolsForOpenAIResponses();
    } else {
      const tools = await this.contentfulMCP!.getToolsForOpenAIResponses();
      return tools;
    }
  }
}
