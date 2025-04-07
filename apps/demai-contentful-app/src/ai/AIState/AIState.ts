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
import { EditComponentEngine } from "./AIPromptEngine/promptEngines/designSystem/EditComponentEngine";

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

  // ENGINE
  promptEngineId: AIPromptEngineID = AIPromptEngineID.OPEN;
  promptEngine: AIPromptEngine;

  // STATE (Handed off to State Editor...)
  isRunning: boolean = false;
  phase: AIStatePhase = AIStatePhase.prompting;
  errors: string[] = [];
  userContent: string = "";
  contextContentSelections: { [key: string]: string } = {};

  // TODO: migrated status into a local object that triggers change events.
  // status: AIStateStatus = {
  //   userContent: "",
  //   contextContentSelections: {},
  //   phase: AIStatePhase.prompting,
  //   isRunning: false,
  //   errors: [],
  // };

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
      case AIPromptEngineID.UPDATE_BRAND_COLORS: {
        return new SaveBrandColorsEngine(aiState);
      }
      case AIPromptEngineID.EDIT_COMPONENT: {
        return new EditComponentEngine(aiState);
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

  async run(
    contentState: ContentState,
    forceExecution: boolean = false,
    autoExecute: boolean = false,
    ignoreContextContent: boolean = false
  ) {
    this.refreshState();
    if (forceExecution === true || this.phase === AIStatePhase.describing) {
      await this.runExecute(contentState);
    } else {
      // Throw it to another bubble...
      const userState = this.clone();
      // this.aiSessionManager.deref()!.addAndActivateAIState(userState);
      this.aiSessionManager.deref()!.resetAndActivateAIState(userState);
      await userState.runAnswerOrDescribe(
        contentState,
        autoExecute,
        ignoreContextContent
      );
    }
  }

  protected async runAnswerOrDescribe(
    contentState: ContentState,
    autoExecute: boolean = false,
    ignoreContextContent: boolean = false
  ) {
    const sessionManager = this.aiSessionManager.deref();
    if (!sessionManager) return;

    const startRunTime = Date.now();

    // SHOW USER PROMPT
    this.processContextSelections(contentState);
    this.request = createPrompt(this, contentState, ignoreContextContent);
    this.isRunning = true;
    this.phase =
      this.promptEngine.toolType === "none"
        ? AIStatePhase.answered
        : AIStatePhase.describing;
    this.updateStatus();

    // RUN
    const runResults = await this.promptEngine.run(this);

    // FINISH
    this.isRunning = false;
    if (runResults.success === true) {
      this.response = this.promptEngine.responseContent(
        `${runResults.result}`,
        this,
        contentState
      );
      this.errors = [];
    } else {
      this.response = this.promptEngine.responseContent(
        `Error.`,
        this,
        contentState
      );
      this.errors = runResults.errors;
    }

    this.updateStatus();
    this.suggestionRunTime = Date.now() - startRunTime;

    if (autoExecute) {
      return this.runExecute(contentState);
    }
  }

  protected async runExecute(contentState: ContentState) {
    const sessionManager = this.aiSessionManager.deref();
    if (!sessionManager) return;

    this.phase = AIStatePhase.executing;
    this.isRunning = true;
    this.startRunTime = Date.now();
    this.updateStatus();

    // RUN
    const executionResults = await this.promptEngine.runExe(this);
    console.log("executionResults", executionResults);

    // FINISH
    this.executeRunTime = Date.now() - this.startRunTime;
    if (executionResults.success === true) {
      const toolSummary = executionResults.toolResults
        ?.map((result) => {
          return result?.content
            ?.map((subContent: any) => {
              if (subContent.text) {
                return subContent.text;
              }
            })
            .join("\n\n");
        })
        .join("\n\n");
      this.executionResponse = `Executed. ${
        executionResults?.toolCalls && executionResults.toolCalls.length > 0
          ? `Used tools: ${executionResults.toolCalls.join(", ")}.
        
${
  toolSummary &&
  `
\`\`\`
${toolSummary}
\`\`\`
`
}`
          : "no tools used"
      }`;
      this.errors = [];
    } else {
      this.errors = executionResults.errors;
    }
    this.phase = AIStatePhase.executed;
    this.isRunning = false;
    this.userContent = ""; // we are done...move on.
    this.updateStatus();

    this.contentChangeEvent && this.contentChangeEvent();
  }

  processContextSelections(contentState: ContentState) {
    const defaultSelections = createContextContentSelectionsDefaults(
      this.promptEngine.contextContent(contentState)
    );
    this.contextContentSelections = {
      ...defaultSelections,
      ...this.contextContentSelections,
    };
    this.updateStatus();
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
      errors: this.errors,
    });
  }
}
