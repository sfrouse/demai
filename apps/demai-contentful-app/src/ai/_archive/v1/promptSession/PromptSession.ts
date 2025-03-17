import OpenAI from "openai";
import { ContentfulMCP } from "../../../mcp/contentfulMCP/ContentfulMCP";
import getOpeAIClient from "../../../openAI/getOpenAIClient";
import {
  AIModels,
  AIPrompt,
  AIPromptMessage,
  AIPromptTemplate,
  OPEN_AI_MAX_TOKENS,
  OPEN_AI_TEMPERATURE,
  OPEN_AI_TOP_P,
} from "../../../openAI/openAIConfig";
import { ChatCompletionTool } from "openai/resources/index.mjs";
import { PromptSessionMode, PromptSessionState } from "./PromptSessionContext";

export class PromptSession {
  private setState: React.Dispatch<React.SetStateAction<PromptSessionState>>;

  private ctfMCP: ContentfulMCP;
  private ctfTools: ChatCompletionTool[] | undefined;
  private openAIClient: OpenAI | undefined;

  private conversationStack: AIPromptMessage[];
  private activePrompt: AIPrompt;
  private activePromptMessage: AIPromptMessage | undefined;

  public promptTemplate: AIPromptTemplate;

  constructor(
    setState: React.Dispatch<React.SetStateAction<PromptSessionState>>,
    promptTemplate: AIPromptTemplate,
    cma: string,
    openAiApiKey: string,
    spaceId: string,
    environmentId: string
    // conversationStack: AIPromptMessage[] = []
  ) {
    this.setState = setState;
    this.promptTemplate = promptTemplate;

    this.activePrompt = {
      model: AIModels.gpt4o,
      messages: [],
      template: promptTemplate,
      tools: [], // ctfTools,
      tool_choice: "none", // don't run right away
      max_tokens: OPEN_AI_MAX_TOKENS,
      top_p: OPEN_AI_TOP_P,
      temperature: OPEN_AI_TEMPERATURE,
    };
    // we are entering a new conversation each time...
    this.conversationStack = [
      { role: "system", content: promptTemplate.system.content },
    ];
    this.ctfMCP = new ContentfulMCP(cma, spaceId, environmentId);
    this.openAIClient = getOpeAIClient(openAiApiKey);

    this.init();
  }

  async init() {
    (async () => {
      this.ctfTools = await this.ctfMCP.getToolsForOpenAI();
      this.activate();
    })();
  }

  activate() {
    this.setState((prev) => ({
      ...prev,
      promptTemplate: this.promptTemplate,
      conversationStack: this.conversationStack,
      isReady: true,
    }));
  }

  // should come in processed...
  async runPrompt(activePromptMessage: AIPromptMessage) {
    this.setState((prev) => ({
      ...prev,
      mode: PromptSessionMode.exploringTools,
    }));
    this.activePromptMessage = activePromptMessage;
    await this.run();
    this.setState((prev) => ({
      ...prev,
      mode: PromptSessionMode.readyToExecute,
    }));
  }

  async executePrompt() {
    await this.run(true);
    this.setState((prev) => ({
      ...prev,
      mode: PromptSessionMode.exploringTools,
    }));
  }

  async updatePrompt() {
    // keep history, but add on w/o template?
  }

  async cancel() {
    // revert session
  }

  private async run(doExecute = false) {
    if (!this.openAIClient || !this.ctfTools) {
      const error = "no ai client, ctftools";
      console.error(error);
      this.setState((prev) => ({ ...prev, error }));
      return;
    }

    if (!doExecute && this.activePromptMessage) {
      this.conversationStack.push(this.activePromptMessage);
      this.setState((prev) => ({
        ...prev,
        conversationStack: this.conversationStack,
        isRunning: true,
        error: undefined,
      }));
    } else {
      this.setState((prev) => ({
        ...prev,
        isRunning: true,
        error: undefined,
      }));
    }

    const { data: stream, response } = await this.openAIClient.chat.completions
      .create({
        model: this.activePrompt.model as string,
        max_tokens: this.activePrompt.max_tokens,
        top_p: this.activePrompt.top_p,
        temperature: this.activePrompt.temperature,
        messages: this.conversationStack as any,
        tools: this.ctfTools,
        tool_choice: doExecute ? "auto" : "none", // don't run right away
        store: true,
      })
      .withResponse();
    console.log("result", stream);

    if (stream.choices && stream.choices.length > 0) {
      const choice = stream.choices[0];

      if (choice.message.tool_calls) {
        // we need to run via mcp...
        console.log("EXE", choice.message.tool_calls);
        for (const toolCall of choice.message.tool_calls) {
          const exeResult = await this.ctfMCP.callFunction(
            toolCall.function.name,
            JSON.parse(toolCall.function.arguments)
          );
          console.log("exeResult", exeResult);
        }
      } else {
        this.conversationStack.push(choice.message);
        this.setState((prev) => ({
          ...prev,
          conversationStack: this.conversationStack,
        }));
      }
    }

    // figure out where we are by assistent entries and change template
    this.setState((prev) => ({
      ...prev,
      isRunning: false,
      mode: doExecute
        ? PromptSessionMode.readyToExecute
        : PromptSessionMode.exploringTools,
    }));
    this.activePromptMessage = undefined;
  }
}
