import AISessionManager from "./AISessionManager";
import {
  AIStateConfig,
  AIStateContent,
  AIStateContentPrefix,
  AIStatePhase,
  AIStatePrompts,
  AIStateStatus,
} from "./AIStateTypes";
import * as icons from "@contentful/f36-icons";
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

  // Prompt State
  role: "user" | "assistant" = "assistant";
  response: string = "(default response...change)"; // response
  toolCalls: any[] = [];

  // Content
  content: AIStateContent = (userPrompt: string) => `${userPrompt}`;
  userContent: string = "";
  contextContent: AIStateContentPrefix = [];
  placeholder: string = "(default placeholder...override";
  ignoreContextContent: boolean = false; // toggles context content
  prompts: AIStatePrompts = {
    cancel: "Nope, Let's Rethink",
    run: "Yes, Let's Do This",
    cancelIcon: icons.DeleteIcon,
    runIcon: icons.StarIcon,
  };

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
    isIntroState: boolean = false
  ) {
    this.key = nanoid(); // Generate a unique key

    this.aiSessionManager = new WeakRef(aiStateManager);
    this.config = config;
    this.promptEngineId = promptEngineId;
    this._setAIStateStatus = setAIStateStatus;

    // Prompt Engine
    this.promptEngine = createAIPromptEngine(this.promptEngineId, this);
    this.contextContent = this.promptEngine.contextContent;
    this.placeholder = this.promptEngine.placeholder;
    this.prompts = this.promptEngine.prompts;

    if (isIntroState) {
      this.response = this.promptEngine.introMessage;
    }
  }

  clone() {
    return new AIState(
      this.aiSessionManager.deref()!,
      this.config,
      this._setAIStateStatus,
      this.promptEngineId
    );
  }

  async run() {
    const sessionManager = this.aiSessionManager.deref();
    if (!sessionManager) return;

    this.isRunning = true;

    // Add an Orphaned User Prompt State...
    const prompt = this.createPrompt();
    const userState = new AIState(
      sessionManager,
      this.config,
      this._setAIStateStatus,
      this.promptEngineId
    );
    userState.role = "user";
    userState.response = prompt;
    userState.phase = AIStatePhase.prompting;
    sessionManager.addAIState(userState);

    // state still controlled here
    this.refreshState();

    // run prompt...
    await this.promptEngine.run();

    // for rehydrating aiStateStatus later...
    this.isRunning = false;
  }

  createPrompt(): string {
    if (this.ignoreContextContent) {
      return this.content ? this.content(this.userContent) : "";
    }
    return [
      ...(this.contextContent?.map((item) =>
        typeof item === "string" ? item : item.value || item.options[0]
      ) || []),
      this.content ? this.content(this.userContent) : "",
    ].join(" ");
  }

  updateStatus(updates?: Partial<AIStateStatus>) {
    if (updates) {
      Object.assign(this, updates);
    }
    this.refreshState();
  }

  refreshState() {
    this._setAIStateStatus({
      isRunning: this.isRunning,
      contextContent: this.contextContent,
      userContent: this.userContent,
      phase: this.phase,
      ignoreContextContent: this.ignoreContextContent,
    });
  }
}
