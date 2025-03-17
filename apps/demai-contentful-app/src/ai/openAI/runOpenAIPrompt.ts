import getOpeAIClient from "./getOpenAIClient";
import {
  AIModels,
  AIPrompt,
  OPEN_AI_MAX_TOKENS,
  OPEN_AI_TEMPERATURE,
  OPEN_AI_TOP_P,
} from "./openAIConfig";

export default async function runOpenAIPrompt(
  apiKey: string,
  prompt: AIPrompt
) {
  const openai = getOpeAIClient(apiKey);
  const { data: stream, response } = await openai.chat.completions
    .create({
      model: prompt.model || AIModels.gpt4o,
      messages: [
        {
          role: "user",
          content: "Create a blog content type now.",
        },
      ],
      tools: prompt.tools,
      tool_choice: prompt.tool_choice,
      max_tokens: prompt.max_tokens || OPEN_AI_MAX_TOKENS,
      top_p: prompt.top_p || OPEN_AI_TOP_P,
      temperature: prompt.temperature || OPEN_AI_TEMPERATURE,
      // store: true,
    })
    .withResponse();
  console.log("completion", response);
  console.log("data", stream);
  return {
    response,
    stream,
  };
}
