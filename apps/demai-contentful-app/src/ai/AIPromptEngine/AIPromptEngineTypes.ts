import { IconComponent, IconProps } from "@contentful/f36-components";
import { ContentState } from "../../../contexts/ContentStateContext/ContentStateContext";

export type PromptRunResults =
  | { success: true; result: string }
  | { success: false; errors: string[] };

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
  RESEARCH_BRAND = "research_brand",
  RESEARCH_STYLES = "research_styles",
  UPDATE_BRAND_COLORS = "update_brand_colors",
  EDIT_COMPONENT = "edit_component",
}

export type AIPromptConfig = {
  cma: string;
  spaceId: string;
  environmentId: string;
  cpa: string;
  openAiApiKey: string;
};

export type AIPromptContextContentSelections = { [key: string]: string };

export type AIPromptContentFunction = (
  userContent: string,
  contextContentSelections: AIPromptContextContentSelections,
  contentState: ContentState
) => string;

export type AIPromptResponseContentFunction = (
  response: string,
  contentState: ContentState
) => string;

export type AIPromptContentPrefixSelect = {
  id: string;
  options: string[];
  labels?: string[];
  defaultValue: string;
  paths?: AIPromptContentPrefix[];
};

export type AIPromptContentPrefix = (string | AIPromptContentPrefixSelect)[];

export type AIPromptPrompts = {
  cancel?: string;
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

export type AIPromptSystemPrompt = {
  role: "system";
  content: string;
};

export type PromptExecuteResults =
  | {
      success: true;
      result: string;
      toolCalls: string[];
      toolResults: any[];
    }
  | {
      success: false;
      errors: string[];
      toolCalls: string[];
      toolResults: any[];
    };
