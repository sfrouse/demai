import { Dispatch, SetStateAction } from "react";
import getOpeAIClient from "../openAI/getOpenAIClient";
import OpenAI from "openai";
import { MCPClient } from "../mcp/contentfulMCP/MCPClient";
import {
  AIModels,
  OPEN_AI_MAX_TOKENS,
  OPEN_AI_TEMPERATURE,
  OPEN_AI_TOP_P,
} from "../openAI/openAIConfig";
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

export class AIAction {
  // Messaging
  protected introMessage: string | undefined;

  // Resources
  private config: AIActionConfig;
  private openAIClient: OpenAI;
  private mcpClient: MCPClient;
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

  // UI Stuff
  public executionPrompt: string = "";
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
    this.mcpClient = new MCPClient(
      this.config.cma,
      this.config.spaceId,
      this.config.environmentId
    );
    this.messageStackManager = messageStackManager;
    this.state = this._refreshState(); // trickery to get typings to quiet
    this.contentChangeEvent = contentChangeEvent;
    // this.initialize(); // need to do this manually, sometimes you don't want the intro message
  }

  public initialize(introMessageOverride?: string) {
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
    if (this.isRunning) return;
    this._refreshState(true);

    this.messageStackManager.addMessage({
      role: "user",
      message: this.createContent(this.userPrompt),
    });

    // run LLM
    const ctfTools = await this.mcpClient.getToolsForOpenAI();
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
            content: this.createContent(this.userPrompt),
          },
        ],
        tools: ctfTools,
        tool_choice: "none",
        store: true,
      })
      .withResponse();
    this.description =
      stream.choices && stream.choices.length > 0
        ? stream.choices[0].message.content
        : "No description";

    this.messageStackManager.addMessage({
      role: "assistant",
      message: `${this.description}`,
      toolCalls: this.toolCalls,
    });

    this.phase = AIActionPhase.described;

    this._refreshState(false);
  }

  public async execute() {
    if (this.isRunning) return;
    this._refreshState(true);
    try {
      const ctfTools = await this.mcpClient.getToolsForOpenAI();
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
          tools: ctfTools,
          tool_choice: "auto",
          store: true,
        })
        .withResponse();
      console.log("resulsss", toolStream);
      this.toolCalls =
        toolStream.choices && toolStream.choices.length > 0
          ? toolStream.choices[0].message.tool_calls
          : undefined;

      console.log("toolDescription", this.toolCalls);

      if (this.toolCalls) {
        for (const toolCall of this.toolCalls) {
          const exeResult = await this.mcpClient.callFunction(
            toolCall.function.name,
            JSON.parse(toolCall.function.arguments)
          );
          console.log("exeResult", exeResult);
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

  public revert() {
    this.userPrompt = "";
    this.contentPrefix = this.initContentPrefix;
    this.phase = AIActionPhase.prompting;
    this._refreshState();
  }

  private _refreshState(isRunning?: boolean) {
    this.state = {
      isRunning: isRunning === undefined ? this.isRunning : isRunning,
      contentPrefix: [...this.contentPrefix],
      userPrompt: this.userPrompt,
      phase: this.phase,
    };
    this.setState(this.state);
    return this.state;
  }

  private createContent(userMessage: string): string {
    return [
      ...(this.contentPrefix?.map((item) =>
        typeof item === "string" ? item : item.value || item.options[0]
      ) || []),
      this.content ? this.content(userMessage) : "",
    ].join(" ");
  }
}
