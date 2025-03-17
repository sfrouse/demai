import {
  AIPromptMessage,
  AIPromptTemplateUserMessage,
} from "../../../openAI/openAIConfig";

// user should be updating template....
export default function userTemplateToAIMessage(
  userMessage: AIPromptTemplateUserMessage
): AIPromptMessage {
  return {
    role: "user",
    content: [
      ...(userMessage.contentPrefix?.map((item) =>
        typeof item === "string" ? item : item.value || item.options[0]
      ) || []),
      userMessage.content,
    ].join(" "),
  };
}
