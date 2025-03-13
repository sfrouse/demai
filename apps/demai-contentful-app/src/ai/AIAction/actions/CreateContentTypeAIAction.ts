import { AIAction } from "../AIAction";
import { AIActionPhase } from "../AIActionTypes";

export class CreateContentTypeAIAction extends AIAction {
  private contentTypeIdsCreated: string[] = [];

  configure() {
    super.configure();
    this.system = {
      role: "system",
      content:
        "You are an expert in Contentful, help this SE learn about Contentful demos. If you find that a tool would be useful, render that tool name in the output.",
    };
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
      try {
        const cTypeResult = JSON.parse(exeResults.content[0].text);
        this.contentTypeIdsCreated.push(cTypeResult.sys.id);
      } catch {
        this.messageStackManager.addMessage({
          role: "assistant",
          message: `${exeResults.content[0].text}`,
        });
      }
    } else {
      super.onToolExecuted(exeResults);
    }
  }

  protected async _executeDescription() {
    this.contentTypeIdsCreated = [];
    await super._executeDescription();

    if (this.contentTypeIdsCreated.length > 0) {
      this.messageStackManager.addMessage({
        role: "assistant",
        message: `Created Content Types with ids: ${this.contentTypeIdsCreated.join(
          ", "
        )}`,
      });
      const publishMessage = `Content types ( ${this.contentTypeIdsCreated.join(
        ", "
      )} ) were created but not published. Would you like to publish them now as well?`;
      this.messageStackManager.addMessage({
        role: "assistant",
        message: publishMessage,
        phase: AIActionPhase.described,
      });

      this.phase = AIActionPhase.described;
      this.description = publishMessage;
      this._refreshState();
    }
  }
}
