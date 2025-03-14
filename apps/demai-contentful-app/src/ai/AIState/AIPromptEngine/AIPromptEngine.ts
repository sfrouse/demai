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

export class AIPromptEngine {
  introMessage: string = "Let's do something";
  contextContent: AIStateContentPrefix = [];
  content: AIStateContent = (userPrompt: string) => `${userPrompt}`;
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
    if (this.toolType === "DemAIDesignSystem") {
      this.designSystemCMPClient = new DesignSystemMCPClient(
        aiState.config.cma,
        aiState.config.spaceId,
        aiState.config.environmentId
      );
    } else {
      this.contentfulMCP = new ContentfulMCP(
        aiState.config.cma,
        aiState.config.spaceId,
        aiState.config.environmentId
      );
    }
  }

  async run() {
    const aiState = this.aiState.deref()!;

    try {
      const tools = await this.getTools();
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
              content: aiState.createPrompt(),
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
      const tools = await this.getTools();
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
          console.log("toolCall", toolCall);
          const exeResult = await this.contentfulMCP?.callFunction(
            toolCall.function.name,
            JSON.parse(toolCall.function.arguments)
          );
          console.log("mcp execute results:", exeResult);
          // this.onToolExecuted(exeResult);
        }
      }

      return toolCalls?.map((tool) => tool.function.name);
    } catch (err) {
      console.error(err);
      return;
    }
  }

  async getTools() {
    // cache?
    if (this.toolType === "DemAIDesignSystem") {
      return await this.designSystemCMPClient!.getToolsForOpenAI();
    } else {
      return await this.contentfulMCP!.getToolsForOpenAI();
    }
  }
}
