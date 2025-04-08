import { AIPromptContextContentSelections } from "./AIPromptEngine/AIPromptEngineTypes";

export type AIStateConfig = {
  cma: string;
  openAiApiKey: string;
  spaceId: string;
  environmentId: string;
  cpa: string;
};

export enum AIStatePhase {
  prompting = "prompting",
  answered = "answered",
  describing = "describing",
  executing = "executing",
  executed = "executed",
  done = "done",
}

export type AIStateStatus = {
  isRunning: boolean;
  contextContentSelections: AIPromptContextContentSelections;
  userContent: string;
  phase: AIStatePhase;
  errors: string[];
};
