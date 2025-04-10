import { Dispatch, SetStateAction } from "react";
import { AIPromptConfig } from "../AIPromptEngine/AIPromptEngineTypes";
import { ContentState } from "../../contexts/ContentStateContext/ContentStateContext";
import { AppError } from "../../contexts/ErrorContext/ErrorContext";

export type AIChainOutput = {
  key: string;
  name: string;
  content: string;
  errors?: string[];
  status: "initialized" | "running" | "done" | "error";
};

export class AIStateChain {
  setAIChainOutput: Dispatch<SetStateAction<AIChainOutput[] | undefined>>;
  aiChainOutput: AIChainOutput[] = [];
  config: AIPromptConfig;
  setInvalidated: Dispatch<SetStateAction<number>>;

  constructor(
    setAIChainOutput: Dispatch<SetStateAction<AIChainOutput[] | undefined>>,
    config: AIPromptConfig,
    setInvalidated: Dispatch<SetStateAction<number>>
  ) {
    this.setAIChainOutput = setAIChainOutput;
    this.config = config;
    this.setInvalidated = setInvalidated;
  }

  async run(contentState: ContentState, addError: (err: AppError) => void) {
    // console.log("Override this function", contentState);
    // addError({
    //   service: "AIStateChain Root",
    //   message: "Override this function",
    // });
  }
}
