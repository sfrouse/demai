import AISessionManager from "./AISessionManager";
import {
  AIPromptEngineID,
  AIStateConfig,
  AIStatePhase,
  AIStateStatus,
} from "./AIStateTypes";
import { nanoid } from "nanoid";
import { AIPromptEngine } from "./AIPromptEngine/AIPromptEngine";
import createPrompt from "./utils/createPrompt";
import { ContentState } from "../../contexts/ContentStateContext/ContentStateContext";
import createContextContentSelectionsDefaults from "./utils/createContextContentSelectionsDefaults";
import { CreateContentTypeEngine } from "./AIPromptEngine/promptEngines/contentful/CreateContentTypeEngine";
import { CreateEntryEngine } from "./AIPromptEngine/promptEngines/contentful/CreateEntryEngine";
import { ChangeTokenColorSetEngine } from "./AIPromptEngine/promptEngines/designSystem/ChangeTokenColorSetEngine";
import { EditContentTypeEngine } from "./AIPromptEngine/promptEngines/contentful/EditContentTypeEngine";
import { CreateWebComponentEngine } from "./AIPromptEngine/promptEngines/designSystem/CreateWebComponentEngine";
import { CreateComponentDefinitionEngine } from "./AIPromptEngine/promptEngines/designSystem/CreateComponentDefinitionEngine";
import { CreateBindingEngine } from "./AIPromptEngine/promptEngines/designSystem/CreateBindingEngine";
import { StylesFromWebSiteEngine } from "./AIPromptEngine/promptEngines/research/StylesFromWebSiteEngine";
import { ContentfulOpenToolingEngine } from "./AIPromptEngine/promptEngines/contentful/ContentfulOpenToolingEngine";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { SaveBrandColorsEngine } from "./AIPromptEngine/promptEngines/research/SaveBrandColorsEngine";

export default class AIState {
  key: string; // Unique key for React lists
  aiSessionManager: WeakRef<AISessionManager>; // avoid circular ref issues...
  config: AIStateConfig;
  setAIStateStatus: React.Dispatch<
    React.SetStateAction<AIStateStatus | undefined>
  >;
  contentChangeEvent?: () => void;

  // PROMPTS
  request: string | undefined;
  response: string | undefined;
  executionResponse: string | undefined;

  // TIMERS
  startRunTime: number | undefined;
  suggestionRunTime: number | undefined;
  executeRunTime: number | undefined;

  // USER CONTENT
  userContent: string = "";
  contextContentSelections: { [key: string]: string } = {};
  ignoreContextContent: boolean = false; // toggles context content

  // ENGINE
  promptEngineId: AIPromptEngineID = AIPromptEngineID.OPEN;
  promptEngine: AIPromptEngine;

  // STATE
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
    contentChangeEvent?: () => void
  ) {
    this.key = nanoid();
    this.aiSessionManager = new WeakRef(aiStateManager);
    this.config = config;
    this.promptEngineId = promptEngineId;
    this.setAIStateStatus = setAIStateStatus;
    this.contentChangeEvent = contentChangeEvent;
    this.promptEngine = AIState.createAIPromptEngine(this.promptEngineId, this);
  }

  static createAIPromptEngine(
    actionName: AIPromptEngineID,
    aiState: AIState
  ): AIPromptEngine {
    switch (actionName) {
      case AIPromptEngineID.CONTENT_MODEL: {
        return new CreateContentTypeEngine(aiState);
      }
      case AIPromptEngineID.ENTRIES: {
        return new CreateEntryEngine(aiState);
      }
      case AIPromptEngineID.DESIGN_TOKENS: {
        return new ChangeTokenColorSetEngine(aiState);
      }
      case AIPromptEngineID.COMPONENT_DEFINITIONS: {
        return new CreateComponentDefinitionEngine(aiState);
      }
      case AIPromptEngineID.WEB_COMPONENTS: {
        return new CreateWebComponentEngine(aiState);
      }
      case AIPromptEngineID.EDIT_CONTENT_TYPE: {
        return new EditContentTypeEngine(aiState);
      }
      case AIPromptEngineID.BINDING: {
        return new CreateBindingEngine(aiState);
      }
      case AIPromptEngineID.CONTENTFUL_OPEN_TOOL: {
        return new ContentfulOpenToolingEngine(aiState);
      }
      case AIPromptEngineID.RESEARCH_STYLES: {
        return new StylesFromWebSiteEngine(aiState);
      }
      case AIPromptEngineID.SAVE_BRAND_COLORS: {
        return new SaveBrandColorsEngine(aiState);
      }
      default: {
        return new AIPromptEngine(aiState); // OpenEndedAIAction;
      }
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

  async run(contentState: ContentState, forceExecution: boolean = false) {
    this.refreshState();
    if (forceExecution === true || this.phase === AIStatePhase.describing) {
      await this.runExecute(contentState);
    } else {
      await this.runAnswerOrDescribe(contentState);
    }
  }

  protected async runAnswerOrDescribe(contentState: ContentState) {
    const sessionManager = this.aiSessionManager.deref();
    if (!sessionManager) return;

    const startRunTime = Date.now();

    // SHOW USER PROMPT
    const userState = this.clone();
    userState.request = this.createPrompt(contentState);
    userState.isRunning = true;
    userState.phase =
      this.promptEngine.toolType === "none"
        ? AIStatePhase.answered
        : AIStatePhase.describing;
    this.aiSessionManager.deref()!.addAndActivateAIState(userState);

    // RUN
    const description = await userState.promptEngine.run(userState);

    // FINISH
    userState.isRunning = false;
    userState.response = userState.promptEngine.responseContent(
      `${description}`,
      this,
      contentState
    );
    userState.updateStatus();
    userState.suggestionRunTime = Date.now() - startRunTime;
  }

  protected async runExecute(contentState: ContentState) {
    const sessionManager = this.aiSessionManager.deref();
    if (!sessionManager) return;

    this.phase = AIStatePhase.executing;
    this.isRunning = true;
    this.startRunTime = Date.now();
    this.updateStatus();

    // RUN
    const toolCalls = await this.promptEngine.runExe(this);

    // FINISH
    this.executeRunTime = Date.now() - this.startRunTime;
    this.executionResponse = `Successfully executed. ${
      toolCalls && toolCalls.length > 0
        ? `Used tools: ${toolCalls.join(", ")}`
        : "no tools used"
    }`;
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
    const history: ChatCompletionMessageParam[] = [];
    lastFour.map((msg: AIState) => {
      if (msg.request) {
        history.push({
          role: "user",
          content: `${msg.request}`,
        });
      }
      if (msg.response) {
        history.push({
          role: "assistant",
          content: msg.response,
        });
      }
    });
    return history;
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
      // runTime: this.runTime,
    });
  }
}
