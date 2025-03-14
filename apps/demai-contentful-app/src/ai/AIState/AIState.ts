import AISessionManager from "./AISessionManager";
import {
  AIStateConfig,
  AIStateContentPrefix,
  AIStatePhase,
  AIStateStatus,
} from "./AIStateTypes";
import createAIPromptEngine, {
  AIPromptEngineID,
} from "./utils/createAIPromptEngine";
import { nanoid } from "nanoid";
import { AIPromptEngine } from "./AIPromptEngine/AIPromptEngine";

export default class AIState {
  key: string; // Unique key for React lists

  aiSessionManager: WeakRef<AISessionManager>; // avoid circular ref issues...
  config: AIStateConfig;
  private _setAIStateStatus: React.Dispatch<
    React.SetStateAction<AIStateStatus | undefined>
  >;
  private contentChangeEvent?: () => void;

  // Prompt State
  role: "user" | "assistant" = "assistant";
  response: string = "(default response...change)"; // response
  //   toolCalls: any[] = [];

  // Content
  //   content: AIStateContent = (userPrompt: string) => `${userPrompt}`;
  userContent: string = "";
  contextContent: AIStateContentPrefix = [];
  ignoreContextContent: boolean = false; // toggles context content

  // Engine
  promptEngineId: AIPromptEngineID = AIPromptEngineID.OPEN;
  promptEngine: AIPromptEngine;

  // State
  isRunning: boolean = false;
  phase: AIStatePhase = AIStatePhase.prompting;

  constructor(
    aiStateManager: AISessionManager,
    config: AIStateConfig,
    setAIStateStatus: React.Dispatch<
      React.SetStateAction<AIStateStatus | undefined>
    >,
    promptEngineId: AIPromptEngineID = AIPromptEngineID.OPEN,
    contentChangeEvent?: () => void,
    isIntroState: boolean = false
  ) {
    this.key = nanoid(); // Generate a unique key

    this.aiSessionManager = new WeakRef(aiStateManager);
    this.config = config;
    this.promptEngineId = promptEngineId;
    this._setAIStateStatus = setAIStateStatus;
    this.contentChangeEvent = contentChangeEvent;

    // Prompt Engine
    this.promptEngine = createAIPromptEngine(this.promptEngineId, this);
    this.contextContent = this.promptEngine.contextContent;

    if (isIntroState) {
      this.response = this.promptEngine.introMessage;
    }
  }

  clone() {
    return new AIState(
      this.aiSessionManager.deref()!,
      this.config,
      this._setAIStateStatus,
      this.promptEngineId,
      this.contentChangeEvent
    );
  }

  async run() {
    this.isRunning = true;
    this.refreshState();

    if (this.phase === AIStatePhase.describing) {
      await this.runExecute();
    } else {
      await this.runAnswerOrDescribe();
    }

    this.isRunning = false;
  }

  private async runAnswerOrDescribe() {
    const sessionManager = this.aiSessionManager.deref();
    if (!sessionManager) return;
    // Add an Orphaned User Prompt State...
    const prompt = this.createPrompt();
    const userState = this.clone();
    userState.role = "user";
    userState.response = prompt;
    userState.phase = AIStatePhase.prompting;
    userState.isRunning = true;
    sessionManager.addAIState(userState);

    // run prompt...
    const description = await this.promptEngine.run();

    // hand off to next action
    const nextAction = this.clone();
    nextAction.role = "assistant";
    nextAction.response = `${description}`;
    nextAction.phase =
      this.promptEngine.toolType === "none"
        ? AIStatePhase.answered
        : AIStatePhase.describing;
    this.aiSessionManager.deref()!.addAndActivateAIState(nextAction);
    nextAction.updateStatus();
  }

  private async runExecute() {
    const sessionManager = this.aiSessionManager.deref();
    if (!sessionManager) return;
    // Add an Orphaned Assistant Prompt State...
    const userState = this.clone();
    userState.role = "assistant";
    userState.response = `${this.promptEngine.executionPrompt}`;
    userState.phase = AIStatePhase.executing;
    userState.isRunning = true;
    sessionManager.addAIState(userState);

    // run prompt...
    const toolCalls = await this.promptEngine.runExe();

    // hand off to next action
    const nextAction = this.clone();
    nextAction.role = "assistant";
    nextAction.response = toolCalls
      ? `Executed ${toolCalls.join(", ")}`
      : "error";
    nextAction.phase = AIStatePhase.executed;
    this.aiSessionManager.deref()!.addAndActivateAIState(nextAction);
    nextAction.updateStatus();
    this.contentChangeEvent && this.contentChangeEvent();
  }

  createPrompt(): string {
    if (this.ignoreContextContent) {
      return this.promptEngine.content
        ? this.promptEngine.content(this.userContent)
        : "";
    }
    return [
      ...(this.contextContent?.map((item) =>
        typeof item === "string" ? item : item.value || item.options[0]
      ) || []),
      this.promptEngine.content
        ? this.promptEngine.content(this.userContent)
        : "",
    ].join(" ");
  }

  updateStatus(updates?: Partial<AIStateStatus>) {
    if (updates) {
      Object.assign(this, updates);
    }
    this.refreshState();
  }

  getStateHistory() {
    const sessionManager = this.aiSessionManager.deref();
    if (!sessionManager) return [];
    const convos = sessionManager.getSessions();
    const lastFour = convos.slice(Math.max(convos.length - 4, 0));
    return lastFour.map((msg: AIState) => ({
      role: msg.role,
      content: msg.response,
    }));
  }

  refreshState() {
    this._setAIStateStatus({
      isRunning: this.isRunning,
      contextContent: this.contextContent,
      userContent: this.userContent,
      phase: this.phase,
      ignoreContextContent: this.ignoreContextContent,
      placeholder: this.promptEngine.placeholder,
      prompts: this.promptEngine.prompts,
    });
  }
}
