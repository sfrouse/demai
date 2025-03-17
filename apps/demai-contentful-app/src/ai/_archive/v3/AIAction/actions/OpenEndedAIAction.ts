import { AIAction } from "../AIAction";

export class OpenEndedAIAction extends AIAction {
  configure() {
    super.configure();
    this.introMessage = "What would you like to know about?";
    this.content = (userPrompt: string) => `${userPrompt}`;
    this.contentPrefix = [];
    this.prompts = {
      ...this.prompts,
      cancel: "No, Let's Rethink this",
      run: "Yes, Let's go",
    };
    this.executionPrompt = "Would you like to execute that recommendation?";
    this.placeholder = "....";
    this.isTool = false;
  }

  protected onToolExecuted(exeResults: any) {
    if (exeResults?.content && exeResults.content.length > 0) {
      const cTypeResult = JSON.parse(exeResults.content[0].text);
      console.log("cTypeResult", cTypeResult);
      if (cTypeResult.sys.type === "Array") {
        this.messageStackManager.addMessage({
          role: "assistant",
          message: `Found array: ${cTypeResult.total} items`,
        });
      } else {
        this.messageStackManager.addMessage({
          role: "assistant",
          message: `Acted on id: ${cTypeResult.sys.id}`,
        });
      }
    } else {
      super.onToolExecuted(exeResults);
    }
  }
}
