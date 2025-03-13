import { AIAction } from "../AIAction";

export class CreateContentTypeAIAction extends AIAction {
  configure() {
    super.configure();
    this.introMessage =
      "Let’s work with Content Types, what would you like to do?";
    this.content = (userPrompt: string) => `${userPrompt}`;
    this.contentPrefix = [
      "Create",
      { options: ["1", "2", "3", "4", "5", "6"], value: "1" },
      "content types",
      "about",
    ];
    this.prompts = {
      ...this.prompts,
      cancel: "No, Let's Rethink this",
      run: "Yes, Let's Create This",
    };
    this.executionPrompt =
      "Would you like to proceed with making these new Content Types?";
    this.placeholder =
      "Describe the kind of content type you would like. Try to be descriptive...";
  }

  protected onToolExecuted(exeResults: any) {
    console.log("exeResults", exeResults);
    if (exeResults?.content && exeResults.content.length > 0) {
      const cTypeResult = JSON.parse(exeResults.content[0].text);

      this.messageStackManager.addMessage({
        role: "assistant",
        message: `Create content type with id: ${cTypeResult.sys.id} [link-to-come]`,
      });
    } else {
      super.onToolExecuted(exeResults);
    }
  }
}
