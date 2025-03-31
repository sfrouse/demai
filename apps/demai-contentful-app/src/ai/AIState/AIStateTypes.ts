import { IconComponent, IconProps } from "@contentful/f36-components";
import { ContentState } from "../../contexts/ContentStateContext/ContentStateContext";
import AIState from "./AIState";

export type AIStateConfig = {
  cma: string;
  openAiApiKey: string;
  spaceId: string;
  environmentId: string;
};

export enum AIStatePhase {
  prompting = "prompting",
  answered = "answered",
  describing = "describing",
  executing = "executing",
  executed = "executed",
  done = "done",
}

export enum AIPromptEngineID {
  RESEARCH = "research",
  CONTENT_MODEL = "content_model",
  EDIT_CONTENT_TYPE = "edit_content_type",
  PUBLISH_CONTENT_MODEL = "publish_content_model",
  ENTRIES = "entries",
  PERSONALIZATION = "personalization",
  DESIGN_TOKENS = "design_tokens",
  COMPONENT_DEFINITIONS = "component_definitions",
  WEB_COMPONENTS = "web_components",
  BINDING = "binding",
  SPACE = "space",
  OPEN = "open",
  CONTENTFUL_OPEN_TOOL = "contentful",
  RESEARCH_STYLES = "research_styles",
}

export type AIStateContent = (
  aiState: AIState,
  contentState: ContentState
) => string;

export type AIStateResponseContent = (
  response: string,
  aiState: AIState,
  contentState: ContentState
) => string;

export type AIStateContentPrefixSelect = {
  id: string;
  options: (string | { label: string; value: string })[];
  defaultValue: string;
  paths?: AIStateContentPrefix[];
};
export type AIStateContentPrefix = (string | AIStateContentPrefixSelect)[];
export type AIStatePrompts = {
  cancel: string;
  run: string;
  cancelIcon?: {
    (props: IconProps<IconComponent>): JSX.Element;
    displayName: string;
  };
  runIcon?: {
    (props: IconProps<IconComponent>): JSX.Element;
    displayName: string;
  };
};

export type AIStateStatus = {
  isRunning: boolean;
  // contextContent: AIStateContentPrefix;
  contextContentSelections: { [key: string]: string };
  userContent: string;
  phase: AIStatePhase;
  ignoreContextContent: boolean;
  placeholder: string;
  prompts: AIStatePrompts;
  // runTime: number | undefined;
};

export type AIStateSystemPrompt = {
  role: "system";
  content: string;
};
