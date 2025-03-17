import { IconComponent, IconProps } from "@contentful/f36-components";

export type AIActionSystemPrompt = {
  role: "system";
  content: string;
};

export type AIMessage = {
  role: "system" | "user" | "assistant";
  message: string;
  toolCalls?: any[];
  phase?: AIActionPhase;
};

export type AIContentPrefixSelect = {
  options: (string | { label: string; value: string })[];
  value: string;
};

export type AIActionContentPrefix = (string | AIContentPrefixSelect)[];
export type AIActionContent = (userPrompt: string) => string;
export type AIActionPrompts = {
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

export enum AIActionPhase {
  prompting = "prompting",
  described = "described",
  executed = "executed",
  done = "done",
}

export type AIActionState = {
  isRunning: boolean;
  contentPrefix: AIActionContentPrefix;
  userPrompt: string;
  phase: AIActionPhase;
  ignoreExecutionPrompt: boolean;
};

export type AIActionConfig = {
  cma: string;
  openAiApiKey: string;
  spaceId: string;
  environmentId: string;
};
