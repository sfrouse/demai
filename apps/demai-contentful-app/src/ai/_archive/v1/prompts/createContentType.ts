import { AIPromptTemplate, MCP_TYPES } from "../../../openAI/openAIConfig";

export default async function createContentTypePrompt(
  userPrompt: string = ""
  // add session info
): Promise<AIPromptTemplate> {
  return {
    system: {
      content:
        "You are an expert in Contentful, help this SE modify their demo.",
    },
    user: {
      contentPrefix: [
        "Create",
        { options: ["1", "2", "3", "4", "5", "6"], value: "1" },
        "content types",
      ],
      content: userPrompt,
    },
    mcp: MCP_TYPES.CONTENTFUL,
    // function conditional chaining...
  };
}
