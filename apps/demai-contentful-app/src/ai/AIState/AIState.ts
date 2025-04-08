import { AIStateConfig, AIStatePhase, AIStateStatus } from "./AIStateTypes";
import { nanoid } from "nanoid";
import { ContentState } from "../../contexts/ContentStateContext/ContentStateContext";
import createContextContentSelectionsDefaults from "./utils/createContextContentSelectionsDefaults";
import { AIPromptEngineID } from "../AIPromptEngine/AIPromptEngineTypes";
import { AIPromptEngine } from "../AIPromptEngine/AIPromptEngine";
import createAIPromptEngine from "../AIPromptEngine/AIPromptEngineFactory";

export default class AIState {
  key: string; // Unique key for React lists
  config: AIStateConfig;
  setAIStateStatus: React.Dispatch<
    React.SetStateAction<AIStateStatus | undefined>
  >;
  contentChangeEvent?: () => void;

  // TIMERS
  startRunTime: number | undefined;
  suggestionRunTime: number | undefined;
  executeRunTime: number | undefined;

  // ENGINE
  promptEngineId: AIPromptEngineID = AIPromptEngineID.OPEN;
  promptEngine: AIPromptEngine;

  // PROMPTS (PROCESSED USER/CONTEXT CONTENT AND RESULTS)
  request: string | undefined;
  response: string | undefined;
  executionResponse: string | undefined;

  // TODO: migrated status into a local object that triggers change events.
  status: AIStateStatus = {
    userContent: "",
    contextContentSelections: {},
    phase: AIStatePhase.prompting,
    isRunning: false,
    errors: [],
  };

  // ==== CONSTRUCTOR ====
  constructor(
    config: AIStateConfig,
    setAIStateStatus: React.Dispatch<
      React.SetStateAction<AIStateStatus | undefined>
    >,
    promptEngineId: AIPromptEngineID = AIPromptEngineID.OPEN,
    contentChangeEvent?: () => void
  ) {
    this.key = nanoid();
    this.config = config;
    this.promptEngineId = promptEngineId;
    this.setAIStateStatus = setAIStateStatus;
    this.contentChangeEvent = contentChangeEvent;
    this.promptEngine = createAIPromptEngine(this.promptEngineId, this.config);
    this.refreshState();
  }

  async run(
    contentState: ContentState,
    forceExecution: boolean = false,
    autoExecute: boolean = false,
    ignoreContextContent: boolean = false
  ) {
    this.refreshState();
    console.log("RUN", forceExecution, this.status.phase);
    if (
      forceExecution === true ||
      this.status.phase === AIStatePhase.describing
    ) {
      await this.runExecute(contentState);
    } else {
      await this.runAnswerOrDescribe(
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
    const startRunTime = Date.now();

    // SHOW USER PROMPT
    this.processContextSelections(contentState);
    this.request = this.promptEngine.createRequest(
      this.status.userContent,
      this.status.contextContentSelections,
      contentState,
      ignoreContextContent
    );
    this.updateStatus({
      isRunning: true,
      phase:
        this.promptEngine.toolType === "none"
          ? AIStatePhase.answered
          : AIStatePhase.describing,
    });

    // RUN
    const runResults = await this.promptEngine.run(this.request);

    // FINISH
    let errors: string[] = [];
    if (runResults.success === true) {
      this.response = this.promptEngine.responseContent(
        `${runResults.result}`,
        contentState
      );
      errors = [];
    } else {
      this.response = this.promptEngine.responseContent(`Error.`, contentState);
      errors = runResults.errors;
    }

    this.updateStatus({
      isRunning: false,
      errors,
    });
    this.suggestionRunTime = Date.now() - startRunTime;

    if (autoExecute) {
      return this.runExecute(contentState);
    }
  }

  protected async runExecute(contentState: ContentState) {
    this.startRunTime = Date.now();
    this.updateStatus({ isRunning: true, phase: AIStatePhase.executing });

    // RUN
    const executionResults = await this.promptEngine.runExe(
      this.request,
      this.response
    );
    console.log("executionResults", executionResults);

    // FINISH
    this.executeRunTime = Date.now() - this.startRunTime;
    let errors: string[] = [];
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
      errors = [];
    } else {
      errors = executionResults.errors;
    }
    this.updateStatus({
      isRunning: false,
      errors,
      phase: AIStatePhase.executed,
    });

    this.contentChangeEvent && this.contentChangeEvent();
  }

  processContextSelections(contentState: ContentState) {
    const defaultSelections = createContextContentSelectionsDefaults(
      this.promptEngine.contextContent(contentState)
    );
    this.status.contextContentSelections = {
      ...defaultSelections,
      ...this.status.contextContentSelections,
    };
    this.updateStatus();
  }

  redo() {
    this.request = "";
    this.response = "";
    this.executionResponse = "";
    this.updateStatus({
      phase: AIStatePhase.prompting,
      isRunning: false,
      errors: [],
    });
  }

  reset() {
    this.request = "";
    this.response = "";
    this.executionResponse = "";
    this.updateStatus({
      userContent: "",
      contextContentSelections: {},
      phase: AIStatePhase.prompting,
      isRunning: false,
      errors: [],
    });
  }
  updateStatus(statusUpdates?: Partial<AIStateStatus>) {
    this.status = { ...this.status, ...statusUpdates };
    this.refreshState();
  }

  refreshState() {
    this.setAIStateStatus({ ...this.status });
  }
}
