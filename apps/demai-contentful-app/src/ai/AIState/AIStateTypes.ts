import { IconComponent, IconProps } from "@contentful/f36-components";

export type AIStateConfig = {
  cma: string;
  openAiApiKey: string;
  spaceId: string;
  environmentId: string;
};

export enum AIStatePhase {
  prompting = "prompting",
  describing = "describing",
  executing = "executing",
  done = "done",
}

export type AIStateContent = (userPrompt: string) => string;
export type AIStateContentPrefixSelect = {
  options: (string | { label: string; value: string })[];
  value: string;
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
  contextContent: AIStateContentPrefix;
  userContent: string;
  phase: AIStatePhase;
  ignoreContextContent: boolean;
};

export type AIStateSystemPrompt = {
  role: "system";
  content: string;
};
