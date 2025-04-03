import { ChatCompletionTool } from "openai/resources/index.mjs";

export const UPDATE_RESEARCH = "update_research";

const updateResearchTool: ChatCompletionTool = {
  type: "function",
  function: {
    name: UPDATE_RESEARCH,
    description:
      "Updates general information about an SE's prospect. This is not related to colors.",
    parameters: {
      type: "object",
      properties: {
        // Don't put "prospect" or "solutionEngineerDescription" here...those should remain manual...
        description: {
          description:
            "This a several paragraphs describing the brand itself which is a concise summary that captures the essence of a brand — what it is, what it does, and what makes it distinct.",
          type: "string",
        },
        products: {
          description:
            "This a several paragraphs describing the brand's product which is is the tangible or digital offering that delivers on its promise to customers. It’s what the brand puts into the world to create value — the tool, service, or experience that people actually use.",
          type: "string",
        },
        tone: {
          description:
            "This a several paragraphs describing tone which is how your brand communicates in a given moment — it changes depending on the context, audience, or situation. It’s the emotional inflection: friendly, serious, playful, empathetic, etc..",
          type: "string",
        },
        style: {
          description:
            "This a several paragraphs describing style which is the consistent rules of communication — grammar, sentence structure, word choice, formatting. It’s the mechanical and structural foundation that keeps communication recognizable and on-brand.",
          type: "string",
        },
        additionalProperties: false,
      },
      required: [],
    },
  },
};

export default updateResearchTool;
