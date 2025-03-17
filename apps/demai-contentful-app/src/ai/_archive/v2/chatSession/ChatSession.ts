import { Dispatch, SetStateAction } from "react";
import getOpeAIClient from "../../../openAI/getOpenAIClient";
import OpenAI from "openai";
import { ContentfulMCP } from "../../../mcp/contentfulMCP/ContentfulMCP";
import {
  AIModels,
  OPEN_AI_MAX_TOKENS,
  OPEN_AI_TEMPERATURE,
  OPEN_AI_TOP_P,
} from "../../../openAI/openAIConfig";

export type ChatSystemPrompt = {
  role: "system";
  content: string;
};

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  message: string;
  toolCalls?: any[];
};

export type AIContentPrefixSelect = {
  options: (string | { label: string; value: string })[];
  value: string;
};

export type ChatAction = {
  introPrompt?: string;
  contentPrefix?: (string | AIContentPrefixSelect)[];
  content: (userPrompt: string) => string;
  message?: string;
  tool_choice?: "none" | "auto" | string;
  prompts?: {
    cancel: string;
    run: string;
  };
};

export type ChatState = {
  isRunning: boolean;
  focusedAction: ChatAction | undefined;
  chatMessages: ChatMessage[];
};

export type ChatConfig = {
  cma: string;
  openAiApiKey: string;
  spaceId: string;
  environmentId: string;
};

export class ChatSession {
  protected model: AIModels = AIModels.gpt4o;
  protected introMessage: string = "Hi, what should we figure out?";
  protected system: ChatSystemPrompt = {
    role: "system",
    content:
      "You are an expert in Contentful, help this SE learn about Contentful demos.",
  };
  protected actions: ChatAction[] = [
    {
      content: (userPrompt: string) => `${userPrompt}`,
    },
  ];
  private actionIndex: number = 0;
  private focusedAction: ChatAction;
  private chatMessages: ChatMessage[] = [];
  private config: ChatConfig;
  private openAIClient: OpenAI;
  private contentfulMCP: ContentfulMCP;

  public state: ChatState;
  private setState: Dispatch<SetStateAction<ChatState | undefined>>; // (state: ChatState) => void;

  constructor(
    setState: Dispatch<SetStateAction<ChatState | undefined>>,
    config: ChatConfig
  ) {
    this.configure(); // override classes time to act
    this.setState = setState;
    this.focusedAction = this.actions[this.actionIndex] || undefined;
    this.chatMessages.push({
      role: "assistant",
      message: this.introMessage,
    });
    this.config = config;
    this.openAIClient = getOpeAIClient(config.openAiApiKey);
    this.contentfulMCP = new ContentfulMCP(
      this.config.cma,
      this.config.spaceId,
      this.config.environmentId
    );
    this.state = this.updateState(); // trickery to get typings to quiet
  }

  configure() {}

  async walkBack() {
    this.chatMessages.pop();
    this.updateState(false);
  }

  async run(userPrompt: string) {
    this.updateState(true);

    this.chatMessages.push({
      role: "user",
      message: this.processChatMessage(this.focusedAction, userPrompt),
    });

    // run LLM
    await this.runLLM(userPrompt);

    this.updateState(false);
  }

  async runLLM(userPrompt: string) {
    const ctfTools = await this.contentfulMCP.getToolsForOpenAI();
    const { data: stream, response } = await this.openAIClient.chat.completions
      .create({
        model: this.model,
        max_tokens: OPEN_AI_MAX_TOKENS,
        top_p: OPEN_AI_TOP_P,
        temperature: OPEN_AI_TEMPERATURE,
        messages: [
          this.system,
          {
            role: "user",
            content: this.processChatMessage(this.focusedAction, userPrompt),
          },
        ],
        tools: ctfTools,
        tool_choice: "none",
        store: true,
      })
      .withResponse();
    console.log("resulsss", stream);
    const toolDescription =
      stream.choices && stream.choices.length > 0
        ? stream.choices[0].message.content
        : "No description";

    // Now get tool details
    const { data: toolStream } = await this.openAIClient.chat.completions
      .create({
        model: this.model,
        max_tokens: OPEN_AI_MAX_TOKENS,
        top_p: OPEN_AI_TOP_P,
        temperature: OPEN_AI_TEMPERATURE,
        messages: [
          this.system,
          //   {
          //     role: "user",
          //     content: this.processChatMessage(this.focusedAction, userPrompt),
          //   },
          stream.choices[0].message,
        ],
        tools: ctfTools,
        tool_choice: "auto",
        store: true,
      })
      .withResponse();
    console.log("resulsss", toolStream);
    const toolCalls =
      toolStream.choices && toolStream.choices.length > 0
        ? toolStream.choices[0].message.tool_calls
        : undefined;

    console.log("toolDescription", toolDescription, toolCalls);

    this.chatMessages.push({
      role: "assistant",
      message: `${toolDescription}`,
      toolCalls: toolCalls,
    });
  }

  async execute(message: ChatMessage) {
    if (message.toolCalls) {
      for (const toolCall of message.toolCalls) {
        const exeResult = await this.contentfulMCP.callFunction(
          toolCall.function.name,
          JSON.parse(toolCall.function.arguments)
        );
        console.log("exeResult", exeResult);
      }
    }
  }

  updateState(isRunning: boolean = false) {
    this.state = {
      isRunning,
      focusedAction: this.focusedAction,
      chatMessages: this.chatMessages,
    };
    this.setState(this.state);
    return this.state;
  }

  processChatMessage(chatAction: ChatAction, userMessage: string): string {
    if (!chatAction) return userMessage;
    return [
      ...(chatAction.contentPrefix?.map((item) =>
        typeof item === "string" ? item : item.value || item.options[0]
      ) || []),
      chatAction.content ? chatAction.content(userMessage) : "",
    ].join(" ");
  }
}
