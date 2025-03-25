import OpenAI from "openai";
import {
  AIModels,
  // OPEN_AI_MAX_TOKENS,
  OPEN_AI_TEMPERATURE,
  OPEN_AI_TOP_P,
} from "./openAIConfig";
import {
  ResponseCreateParamsNonStreaming,
  ResponseFunctionToolCall,
  ResponseInputItem,
  ResponseOutputItem,
  Tool,
  ToolChoiceFunction,
  ToolChoiceOptions,
  ToolChoiceTypes,
} from "openai/resources/responses/responses.mjs";

export default async function openAIResponses(params: {
  openAIClient: OpenAI;
  systemPrompt: ResponseInputItem;
  userPrompt: ResponseInputItem;
  prevMessages?: ResponseInputItem[];
  tools?: Tool[];
  tool_choice?:
    | ToolChoiceOptions
    | ToolChoiceTypes
    | ToolChoiceFunction
    | undefined;
  model?: AIModels;
  max_tokens?: number;
  top_p?: number;
  temperature?: number;
}): Promise<{
  description: string;
  toolCalls: ResponseFunctionToolCall[];
}> {
  const {
    openAIClient,
    systemPrompt,
    userPrompt,
    prevMessages = [],
    tools = [],
    tool_choice,
    model = AIModels.gpt4o,
    // max_tokens = OPEN_AI_MAX_TOKENS,
    top_p = OPEN_AI_TOP_P,
    temperature = OPEN_AI_TEMPERATURE,
  } = params;

  const body: ResponseCreateParamsNonStreaming = {
    model,
    // max_tokens,
    top_p,
    temperature,
    input: [systemPrompt, ...prevMessages, userPrompt],
    tools,
    tool_choice,
  };

  const response = await openAIClient.responses.create(body);

  console.log("run results:", response);

  return {
    description: response.output_text,
    toolCalls: response.output as ResponseFunctionToolCall[],
  };
}
