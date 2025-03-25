import OpenAI from "openai";
import {
  AIModels,
  OPEN_AI_MAX_TOKENS,
  OPEN_AI_TEMPERATURE,
  OPEN_AI_TOP_P,
} from "./openAIConfig";

export default async function openAIChatCompletions(params: {
  openAIClient: OpenAI;
  systemPrompt: OpenAI.Chat.Completions.ChatCompletionMessageParam;
  userPrompt: OpenAI.Chat.Completions.ChatCompletionMessageParam;
  prevMessages?: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
  tools?: OpenAI.Chat.Completions.ChatCompletionTool[];
  tool_choice?: OpenAI.Chat.Completions.ChatCompletionToolChoiceOption;
  model?: AIModels;
  max_tokens?: number;
  top_p?: number;
  temperature?: number;
}) {
  const {
    openAIClient,
    systemPrompt,
    userPrompt,
    prevMessages = [],
    tools = [],
    tool_choice,
    model = AIModels.gpt4o,
    max_tokens = OPEN_AI_MAX_TOKENS,
    top_p = OPEN_AI_TOP_P,
    temperature = OPEN_AI_TEMPERATURE,
  } = params;

  const body: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming = {
    model,
    max_tokens,
    top_p,
    temperature,
    messages: [systemPrompt, ...prevMessages, userPrompt],
    tools,
    tool_choice,
  };

  const { data: stream } = await openAIClient.chat.completions
    .create(body)
    .withResponse();

  console.log("run results:", stream);
  const description =
    stream.choices && stream.choices.length > 0
      ? stream.choices[0].message.content
      : "No description";
  const toolCalls =
    stream.choices && stream.choices.length > 0
      ? stream.choices[0].message.tool_calls
      : undefined;

  return {
    description,
    toolCalls,
  };
}
