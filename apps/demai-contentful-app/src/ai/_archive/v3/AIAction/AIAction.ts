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
import {
  AIActionConfig,
  AIActionContent,
  AIActionContentPrefix,
  AIActionPhase,
  AIActionPrompts,
  AIActionState,
  AIActionSystemPrompt,
} from "./AIActionTypes";
import { MessageStackManager } from "../MessageStackManager/MessageStackManager";
import * as icons from "@contentful/f36-icons";
import { DesignSystemMCPClient } from "../../../mcp/designSystemMCP/DesignSystemMCPClient";

export class AIAction {
  // Messaging
  protected introMessage: string | undefined;

  // Resources
  private config: AIActionConfig;
  private openAIClient: OpenAI;
  private contentfulMCP: ContentfulMCP;
  private designSystemCMPClient: DesignSystemMCPClient;
  protected messageStackManager: MessageStackManager;
  protected contentChangeEvent?: () => void;

  // Prompt Basics
  protected model: AIModels = AIModels.gpt4o;
  protected system: AIActionSystemPrompt = {
    role: "system",
    content:
      "You are an expert in Contentful, help this SE learn about Contentful demos.",
  };
  protected toolChoice: "none" | "auto" | "required" = "none";
  protected isTool: boolean = true; // no easy way to figure out if something is a tool or not from AI results
  protected toolType: "DemAIDesignSystem" | "Contentful" = "Contentful";

  // UI Stuff
  public executionPrompt: string = "";
  public ignoreExecutionPrompt: boolean = false;
  public prompts: AIActionPrompts = {
    cancel: "Nope, Cancel",
    run: "Yes, Let's Do This",
    cancelIcon: icons.DeleteIcon,
    runIcon: icons.StarIcon,
  };
  public placeholder: string = "Describe what you would like to do...";

  // State
  public state: AIActionState;
  protected userPrompt: string = "";
  protected content: AIActionContent = (userPrompt: string) => `${userPrompt}`;
  protected contentPrefix: AIActionContentPrefix = [];
  private initContentPrefix: AIActionContentPrefix = [];
  protected isRunning: boolean = false;
  protected description: string | undefined | null;
  protected toolCalls: any[] | undefined;
  protected phase: AIActionPhase = AIActionPhase.prompting;
  private setState: Dispatch<SetStateAction<AIActionState | undefined>>; // (state: AIActionState) => void;

  constructor(
    setState: Dispatch<SetStateAction<AIActionState | undefined>>,
    config: AIActionConfig,
    messageStackManager: MessageStackManager,
    contentChangeEvent?: () => void
  ) {
    this.configure(); // overriding class's time to act
    this.initContentPrefix = this.contentPrefix; // going to be editing contentPrefix
    this.setState = setState;
    this.config = config;
    this.openAIClient = getOpeAIClient(config.openAiApiKey);
    this.contentfulMCP = new ContentfulMCP(
      this.config.cma,
      this.config.spaceId,
      this.config.environmentId
    );
    this.messageStackManager = messageStackManager;
    this.contentChangeEvent = contentChangeEvent;

    const lastMessage = this.messageStackManager.getLastMessage();
    if (this.isTool && lastMessage?.phase === AIActionPhase.described) {
      this.phase = AIActionPhase.described;
      this.description = lastMessage.message;
    }
    this.state = this._refreshState(); // trickery to get typings to quiet

    this.designSystemCMPClient = new DesignSystemMCPClient(
      this.config.cma,
      this.config.spaceId,
      this.config.environmentId
    );
  }

  public initialize(introMessageOverride?: string) {
    this.designSystemCMPClient.getToolsForOpenAI();
    // todo look for last message...not one or one that ended...
    this.introMessage = introMessageOverride || this.introMessage;
    if (this.introMessage) {
      this.messageStackManager.addMessage({
        role: "assistant",
        message: this.introMessage,
      });
    }
  }

  protected configure() {
    // overriding class's time to act
  }

  public async run() {
    if (this.phase === AIActionPhase.described) {
      return this._executeDescription();
    } else {
      return this._findDescription();
    }
  }

  private async _findDescription() {
    if (this.isRunning) return;
    this._refreshState(true);

    const prevConvos = this.getPreviousConversation();
    this.messageStackManager.addMessage({
      role: "user",
      message: this.createContent(this.userPrompt),
    });

    // run LLM
    const tools = this.isTool
      ? this.toolType === "DemAIDesignSystem"
        ? await this.designSystemCMPClient.getToolsForOpenAI()
        : await this.contentfulMCP.getToolsForOpenAI()
      : [];
    console.log("ctfTool", tools);

    const body: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming =
      {
        model: this.model,
        max_tokens: OPEN_AI_MAX_TOKENS,
        top_p: OPEN_AI_TOP_P,
        temperature: OPEN_AI_TEMPERATURE,
        messages: [
          this.system,
          ...prevConvos,
          {
            role: "user",
            content: this.createContent(this.userPrompt),
          },
        ],
        tools,
        tool_choice: "none",
        // store: true, // not working the way I think...
      };
    const { data: stream, response } = await this.openAIClient.chat.completions
      .create(body)
      .withResponse();
    console.log("run results:", stream);
    this.description =
      stream.choices && stream.choices.length > 0
        ? stream.choices[0].message.content
        : "No description";

    this.messageStackManager.addMessage({
      role: "assistant",
      message: `${this.description}`,
      phase: AIActionPhase.described,
    });

    if (this.isTool) {
      this.phase = AIActionPhase.described;
    } else {
      this.phase = AIActionPhase.prompting;
      this.userPrompt = "";
    }

    this._refreshState(false);
  }

  protected async _executeDescription() {
    if (this.isRunning) return;
    this._refreshState(true);
    try {
      const tools =
        this.toolType === "DemAIDesignSystem"
          ? await this.designSystemCMPClient.getToolsForOpenAI()
          : await this.contentfulMCP.getToolsForOpenAI();
      const { data: toolStream } = await this.openAIClient.chat.completions
        .create({
          model: this.model,
          max_tokens: OPEN_AI_MAX_TOKENS,
          top_p: OPEN_AI_TOP_P,
          temperature: OPEN_AI_TEMPERATURE,
          messages: [
            this.system,
            {
              role: "assistant",
              content: this.description,
            },
          ],
          tools,
          tool_choice: "required",
          // store: true, // not working the way I think...
        })
        .withResponse();
      console.log("execute result:", toolStream);
      this.toolCalls =
        toolStream.choices && toolStream.choices.length > 0
          ? toolStream.choices[0].message.tool_calls
          : undefined;

      this.messageStackManager.addMessage({
        role: "assistant",
        message: `Executing ${this.toolCalls
          ?.map((call) => call.function.name)
          .join(", ")}`,
        phase: AIActionPhase.executed,
      });

      if (this.toolCalls) {
        for (const toolCall of this.toolCalls) {
          console.log("toolCall", toolCall);
          const contentfulMCP =
            this.toolType === "DemAIDesignSystem"
              ? await this.designSystemCMPClient
              : await this.contentfulMCP;
          const exeResult = await contentfulMCP.callFunction(
            toolCall.function.name,
            JSON.parse(toolCall.function.arguments)
          );
          console.log("mcp execute results:", exeResult);
          this.onToolExecuted(exeResult);
        }
      }
      this.phase = AIActionPhase.executed;
      if (this.contentChangeEvent) this.contentChangeEvent();
    } catch (err) {
      console.error(err);
      this.phase = AIActionPhase.described;
      this.messageStackManager.addMessage({
        role: "assistant",
        message: `error: something went wrong.`,
      });
    }

    this._refreshState(false);
  }

  protected onToolExecuted(exeResults: any) {
    this.messageStackManager.addMessage({
      role: "assistant",
      message: `Executed request.`,
      phase: AIActionPhase.executed,
    });
  }

  // External updates
  public updateContentPrefix(newContentPrefix: AIActionContentPrefix) {
    this.contentPrefix = newContentPrefix;
    return this._refreshState();
  }

  public updateUserPrompt(newUserPrompt: string) {
    this.userPrompt = newUserPrompt;
    return this._refreshState();
  }

  public updatePhase(newPhase: AIActionPhase) {
    this.phase = newPhase;
    return this._refreshState();
  }

  public updateIgnoreExecutionPrompt(newIgnoreExecutionPrompt: boolean) {
    this.ignoreExecutionPrompt = newIgnoreExecutionPrompt;
    return this._refreshState();
  }

  public revert() {
    this.userPrompt = "";
    this.contentPrefix = this.initContentPrefix;
    this.ignoreExecutionPrompt = false;
    this.phase = AIActionPhase.prompting;
    this.messageStackManager.resetMessages();
    this.initialize();
    this._refreshState();
  }

  protected _refreshState(isRunning?: boolean) {
    this.state = {
      isRunning: isRunning === undefined ? this.isRunning : isRunning,
      contentPrefix: [...this.contentPrefix],
      userPrompt: this.userPrompt,
      phase: this.phase,
      ignoreExecutionPrompt: this.ignoreExecutionPrompt,
    };
    this.setState(this.state);
    return this.state;
  }

  private createContent(userMessage: string): string {
    if (this.ignoreExecutionPrompt) {
      return this.content ? this.content(userMessage) : "";
    }
    return [
      ...(this.contentPrefix?.map((item) =>
        typeof item === "string" ? item : item.value || item.options[0]
      ) || []),
      this.content ? this.content(userMessage) : "",
    ].join(" ");
  }

  private getPreviousConversation() {
    const convos = this.messageStackManager.getMessages();
    const lastFour = convos.slice(Math.max(convos.length - 4, 0));
    return lastFour.map((msg) => ({
      role: msg.role,
      content: msg.message,
    }));
  }
}
