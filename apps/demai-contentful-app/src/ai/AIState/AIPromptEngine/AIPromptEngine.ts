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
  AIStateSystemPrompt,
} from "../AIStateTypes";
import * as icons from "@contentful/f36-icons";
import { DesignSystemMCPClient } from "../../mcp/designSystemMCP/DesignSystemMCPClient";
import { ContentfulMCP } from "../../mcp/contentfulMCP/ContentfulMCP";
import getOpeAIClient from "../../openAI/getOpenAIClient";
import { ContentState } from "../../../contexts/ContentStateContext/ContentStateContext";

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
      let tools = await this.getTools();
      if (this.toolFilters && this.toolFilters.length > 0) {
        tools = tools.filter((tool) =>
          this.toolFilters.includes(tool.function.name) ? true : false
        );
      }
      const prevState = aiState.getStateHistory();
      const body: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming =
        {
          model: this.model,
          max_tokens: OPEN_AI_MAX_TOKENS,
          top_p: OPEN_AI_TOP_P,
          temperature: OPEN_AI_TEMPERATURE,
          messages: [
            this.system,
            ...prevState,
            {
              role: "user",
              content: aiState.createPrompt(contentState),
            },
          ],
          tools,
          tool_choice: "none",
          // store: true, // not working the way I think...
        };
      const { data: stream, response } =
        await this.openAIClient.chat.completions.create(body).withResponse();
      console.log("run results:", stream);
      const description =
        stream.choices && stream.choices.length > 0
          ? stream.choices[0].message.content
          : "No description";

      return description;
    } catch (err) {
      console.error(err);
      return "Error";
    }
  }

  async runExe(): Promise<string[] | undefined> {
    const aiState = this.aiState.deref()!;

    try {
      let tools = await this.getTools();
      if (this.toolFilters && this.toolFilters.length > 0) {
        tools = tools.filter((tool) =>
          this.toolFilters.includes(tool.function.name) ? true : false
        );
      }
      const body: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming =
        {
          model: this.model,
          max_tokens: OPEN_AI_MAX_TOKENS,
          top_p: OPEN_AI_TOP_P,
          temperature: OPEN_AI_TEMPERATURE,
          messages: [
            this.system,
            {
              role: "assistant",
              content: aiState.response,
            },
          ],
          tools,
          tool_choice: "required",
          // store: true, // not working the way I think...
        };
      const { data: toolStream, response } =
        await this.openAIClient.chat.completions.create(body).withResponse();
      console.log("execute result:", toolStream);
      const toolCalls =
        toolStream.choices && toolStream.choices.length > 0
          ? toolStream.choices[0].message.tool_calls
          : undefined;

      if (toolCalls) {
        for (const toolCall of toolCalls) {
          const mcpClient =
            this.toolType === "DemAIDesignSystem"
              ? this.designSystemCMPClient
              : this.contentfulMCP;
          const exeResult = await mcpClient?.callFunction(
            toolCall.function.name,
            JSON.parse(toolCall.function.arguments)
          );
          // this.onToolExecuted(exeResult);
          if (exeResult?.isError === true) {
            return exeResult.content &&
              Array.isArray(exeResult.content) &&
              exeResult.content.length > 0
              ? exeResult.content[0].text
              : ["error"];
          }
        }
      }

      return toolCalls?.map((tool) => tool.function.name);
    } catch (err) {
      console.error(err);
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
}
