import { ChatSession } from "../ChatSession";

export class CreateCTypeChatSession extends ChatSession {
  configure() {
    this.introMessage =
      "What kind of content type(s) would you like to create?";
    this.actions = [
      {
        contentPrefix: [
          "Create",
          { options: ["1", "2", "3", "4", "5", "6"], value: "2" },
          "content types",
        ],
        content: (userPrompt: string) => `${userPrompt}`,
        tool_choice: "create_content_type",
        prompts: {
          cancel: "Nope, Cancel",
          run: "Yes, Execute",
        },
      },
      {
        introPrompt: "Would you like to publish this now?",
        content: (userPrompt: string) => `${userPrompt}`,
        tool_choice: "publish_content_type",
        prompts: {
          cancel: "Nope, Cancel",
          run: "Yes, Execute",
        },
      },
    ];
  }
}
