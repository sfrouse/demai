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

export type AIStateContent = (
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
};

export type AIStateSystemPrompt = {
  role: "system";
  content: string;
};
