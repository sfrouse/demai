import AISessionManager from "./AISessionManager";
import { AIStateConfig, AIStatePhase, AIStateStatus } from "./AIStateTypes";
import createAIPromptEngine, {
  AIPromptEngineID,
} from "./utils/createAIPromptEngine";
import { nanoid } from "nanoid";
import { AIPromptEngine } from "./AIPromptEngine/AIPromptEngine";
import createPrompt from "./utils/createPrompt";
import { ContentState } from "../../contexts/ContentStateContext/ContentStateContext";
import createContextContentSelectionsDefaults from "./utils/createContextContentSelectionsDefaults";

export default class AIState {
  key: string; // Unique key for React lists

  aiSessionManager: WeakRef<AISessionManager>; // avoid circular ref issues...
  config: AIStateConfig;
  setAIStateStatus: React.Dispatch<
    React.SetStateAction<AIStateStatus | undefined>
  >;
  contentChangeEvent?: () => void;

  // Prompt State
  role: "user" | "assistant" = "assistant";
  response: string = "(default response...change)";
  executionResponse: string = "";

  // Content
  userContent: string = "";
  // contextContent: AIStateContentPrefix = [];
  contextContentSelections: { [key: string]: string } = {};
  ignoreContextContent: boolean = false; // toggles context content

  // Engine
  promptEngineId: AIPromptEngineID = AIPromptEngineID.OPEN;
  promptEngine: AIPromptEngine;

  // State
  isRunning: boolean = false;
  phase: AIStatePhase = AIStatePhase.prompting;

  // ==== CONSTRUCTOR ====
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
    this.setAIStateStatus = setAIStateStatus;
    this.contentChangeEvent = contentChangeEvent;

    // Prompt Engine
    this.promptEngine = createAIPromptEngine(this.promptEngineId, this);

    if (isIntroState) {
      this.response = this.promptEngine.introMessage;
    }
  }

  clone(deep: boolean = true) {
    const clone = new AIState(
      this.aiSessionManager.deref()!,
      this.config,
      this.setAIStateStatus,
      this.promptEngineId,
      this.contentChangeEvent
    );
    if (deep) {
      clone.contextContentSelections = JSON.parse(
        JSON.stringify(this.contextContentSelections)
      );
      clone.userContent = this.userContent;
    }
    return clone;
  }

  async run(contentState: ContentState) {
    this.isRunning = true;
    this.refreshState();

    if (
      this.phase === AIStatePhase.describing ||
      this.phase === AIStatePhase.executed
    ) {
      await this.runExecute();
    } else {
      await this.runAnswerOrDescribe(contentState);
    }

    this.isRunning = false;
  }

  protected async runAnswerOrDescribe(contentState: ContentState) {
    const sessionManager = this.aiSessionManager.deref();
    if (!sessionManager) return;
    // Add an Orphaned User Prompt State...
    const prompt = this.createPrompt(contentState);
    const userState = this.clone();
    userState.role = "user";
    userState.response = prompt;
    userState.phase = AIStatePhase.prompting;
    userState.isRunning = true;
    sessionManager.addAIState(userState);

    // run prompt...
    const description = await userState.promptEngine.run(contentState);

    userState.isRunning = false;

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

  protected async runExecute() {
    const sessionManager = this.aiSessionManager.deref();
    if (!sessionManager) return;

    this.phase = AIStatePhase.executing;
    this.isRunning = true;
    const toolCalls = await this.promptEngine.runExe();
    this.executionResponse = `Executed : ${toolCalls}`;
    this.phase = AIStatePhase.executed;
    this.isRunning = false;
    this.updateStatus();

    this.contentChangeEvent && this.contentChangeEvent();
  }

  createPrompt(contentState: ContentState): string {
    const defaultSelections = createContextContentSelectionsDefaults(
      this.promptEngine.contextContent(contentState)
    );
    this.contextContentSelections = {
      ...defaultSelections,
      ...this.contextContentSelections,
    };
    this.updateStatus();

    return createPrompt(this, contentState);
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
    this.setAIStateStatus({
      isRunning: this.isRunning,
      contextContentSelections: this.contextContentSelections,
      userContent: this.userContent,
      phase: this.phase,
      ignoreContextContent: this.ignoreContextContent,
      placeholder: this.promptEngine.placeholder,
      prompts: this.promptEngine.prompts,
    });
  }
}
