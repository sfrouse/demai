export enum AIModels {
  gpt4Turbo = "gpt-4-turbo",
  gpt4oMini = "gpt-4o-mini",
  gpt4o = "gpt-4o",
}

export const OPEN_AI_MODEL = AIModels.gpt4o;
// const OPEN_AI_TOKEN_LIMIT = 5000;
export const OPEN_AI_MAX_TOKENS = 3000;
export const OPEN_AI_TEMPERATURE = 0.7;
export const OPEN_AI_TOP_P = 0;

export type AIPromptSelect = {
  options: (string | { label: string; value: string })[];
  value: string;
};

export enum MCP_TYPES {
  CONTENTFUL = "CONTENTFUL",
  NONE = "NONE",
}

export type AIPromptMessage = {
  role: "system" | "user" | "assistant";
  content: string | null;
};

export type AIPrompt = {
  model?: AIModels;
  messages: (AIPromptMessage | (() => AIPromptMessage | AIPromptMessage[]))[];
  template: AIPromptTemplate;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  tools?: any;
  tool_choice?: "auto" | "none";
  mcp?: MCP_TYPES;
};

export type AIPromptTemplateSystemMessage = {
  content: string;
};
export type AIPromptTemplateUserMessage = AIPromptTemplateSystemMessage & {
  contentPrefix?: (string | AIPromptSelect)[];
};

export type AIPromptTemplate = {
  system: AIPromptTemplateSystemMessage;
  user: AIPromptTemplateUserMessage;
  mcp: MCP_TYPES;
};
