import { AIAction } from "../AIAction";
import { AIActionPhase } from "../AIActionTypes";

export class ChangeTokenColorSetAIAction extends AIAction {
  private contentTypeIdsCreated: string[] = [];

  configure() {
    super.configure();
    this.system = {
      role: "system",
      content: `You are an expert in Design Systems and are helping guide a Solutions Engineer navigate customizing the colors on their website for a specific prospect.
        If you find that a tool would be useful, render that tool name in the output.
        Please show the hex colors for each step on each question.`,
    };
    this.introMessage =
      "Let's update some colors, what would you like to change?";
    this.content = (userPrompt: string) =>
      `${userPrompt}. Please show the hex colors for each step.`;
    this.contentPrefix = [
      "Change the ",
      {
        options: ["primary", "secondary", "tertiary", "neutral", "warning"],
        value: "primary",
      },
      "color set using the hex:",
    ];
    this.prompts = {
      ...this.prompts,
      cancel: "No, let's go back",
      run: "Yup, let's do it",
    };
    this.executionPrompt =
      "Would you like to proceed with changing this color?";
    this.placeholder =
      "Add the hex and any details about the color stepping...";
    this.toolType = "DemAIDesignSystem";
  }

  protected async _executeDescription() {
    this.contentTypeIdsCreated = [];
    await super._executeDescription();

    if (this.contentTypeIdsCreated.length > 0) {
      this.messageStackManager.addMessage({
        role: "assistant",
        message: `Colors Updated!`,
      });

      this.phase = AIActionPhase.described;
      this.description = "Colors Updated!";
      this._refreshState();
    }
  }
}
