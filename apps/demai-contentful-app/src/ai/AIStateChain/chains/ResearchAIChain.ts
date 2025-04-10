import { nanoid } from "nanoid";
import { ContentState } from "../../../contexts/ContentStateContext/ContentStateContext";
import { ResearchFromWebSiteEngine } from "../../AIPromptEngine/promptEngines/research/ResearchFromWebSiteEngine";
import { AIChainOutput, AIStateChain } from "../AIStateChain";
import { AppError } from "../../../contexts/ErrorContext/ErrorContext";

export default class ResearchAIChain extends AIStateChain {
  async run(contentState: ContentState, addError: (err: AppError) => void) {
    super.run(contentState, addError);

    await this.runResearch(
      contentState,
      ResearchFromWebSiteEngine.ACTION_RESEARCH_BRAND_DESCRIPTION,
      this.descriptionOutput,
      addError
    );
    await this.runResearch(
      contentState,
      ResearchFromWebSiteEngine.ACTION_RESEARCH_BRAND_PRODUCT,
      this.productOutput,
      addError
    );
    await this.runResearch(
      contentState,
      ResearchFromWebSiteEngine.ACTION_RESEARCH_BRAND_STYLE,
      this.styleOutput,
      addError
    );
    await this.runResearch(
      contentState,
      ResearchFromWebSiteEngine.ACTION_RESEARCH_BRAND_TONE,
      this.toneOutput,
      addError
    );
  }

  productOutput: AIChainOutput = {
    key: nanoid(),
    name: "Research - Brand Product",
    content: "",
    status: "initialized",
  };
  styleOutput: AIChainOutput = {
    key: nanoid(),
    name: "Research - Brand Style",
    content: "",
    status: "initialized",
  };
  toneOutput: AIChainOutput = {
    key: nanoid(),
    name: "Research - Brand Tone",
    content: "",
    status: "initialized",
  };
  descriptionOutput: AIChainOutput = {
    key: nanoid(),
    name: "Research - Brand Description",
    content: "",
    status: "initialized",
  };

  async runResearch(
    contentState: ContentState,
    researchTopic: string,
    output: AIChainOutput,
    addError: (err: AppError) => void
  ) {
    const researchEngine = new ResearchFromWebSiteEngine(this.config);
    const contextDefaults =
      researchEngine.getContextContentSelectionDefaults(contentState);

    output.status = "running";
    this.updateOutput();
    const request = researchEngine.createRequest(
      "",
      {
        ...contextDefaults,
        [ResearchFromWebSiteEngine.ACTION_RESEARCH_ID]: researchTopic,
      },
      contentState
    );
    const results = await researchEngine.runAndExec(
      request,
      contentState,
      addError
    );

    if (results.success) {
      output.content = results.result?.substring(0, 40);
      output.status = "done";
    } else {
      output.errors = results.errors;
      output.status = "error";
    }
    this.updateOutput();
    this.setInvalidated((prev) => prev + 1);
    return results;
  }

  updateOutput() {
    this.setAIChainOutput([
      this.descriptionOutput,
      this.productOutput,
      this.styleOutput,
      this.toneOutput,
    ]);
  }
}
