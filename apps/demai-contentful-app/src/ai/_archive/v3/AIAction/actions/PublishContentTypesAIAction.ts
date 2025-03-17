import { AIAction } from "../AIAction";
import { AIActionPhase } from "../AIActionTypes";

export class PublishContentTypeAIAction extends AIAction {
  configure() {
    super.configure();
    this.introMessage =
      "Let’s publish some Content Types. Which ones would you like to start with?";
    this.content = (userPrompt: string) => `${userPrompt}`;
    this.contentPrefix = [
      "Publish these Content Types",
      { options: ["all", "all unpublished", "specific one"], value: "all" },
    ];
    this.prompts = {
      ...this.prompts,
      cancel: "No, Let's Rethink this",
      run: "Yes, Let's Publish",
    };
    this.executionPrompt = "Would you like to publish those Content Types?";
    this.placeholder = "....";
  }

  protected onToolExecuted(exeResults: any) {
    console.log("exeResults", exeResults);
    if (exeResults?.content && exeResults.content.length > 0) {
      const cTypeResult = JSON.parse(exeResults.content[0].text);
      this.messageStackManager.addMessage({
        role: "assistant",
        message: `Published content type with id: ${cTypeResult.sys.id}`,
        phase: AIActionPhase.executed,
      });
    } else {
      super.onToolExecuted(exeResults);
    }
  }
}
