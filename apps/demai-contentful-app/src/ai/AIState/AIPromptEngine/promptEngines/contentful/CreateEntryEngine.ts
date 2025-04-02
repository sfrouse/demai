import { ContentState } from "../../../../../contexts/ContentStateContext/ContentStateContext";
import AIState from "../../../AIState";
import { AIPromptEngine } from "../../AIPromptEngine";

export class CreateEntryEngine extends AIPromptEngine {
  constructor(aiState: AIState) {
    super(aiState);

    this.introMessage = "Let’s create some entries, what would you like to do?";
    this.executionPrompt = "Creating your Entries...";
    this.placeholder =
      "Describe the kind of entries you would like. Try to be descriptive...";
    this.system = {
      role: "system",
      content: `
You are an expert in Contentful, help this SE learn about Contentful demos.
You are specifically helping them create entries in line with a demo they are about to give to a prospect.
If you find that a tool would be useful, render that tool name in the output.
Don't forget to include all the new fields in the function call. This is essential.
`,
    };
    this.toolType = "Contentful";
    this.toolFilters = ["create_entry"];

    // CONTEXT CONTENT
    this.contextContent = (contentState: ContentState) => [
      "Create",
      {
        id: "numberOfCTypes",
        options: ["1", "2", "3", "4", "5", "6"],
        defaultValue: "1",
      },
      "entries of content type:",
      {
        id: "ctypeId",
        options: contentState.contentTypes?.map((ctype) => ctype.sys.id) || [],
        labels: contentState.contentTypes?.map((ctype) => ctype.name) || [],
        defaultValue:
          contentState.contentTypes && contentState.contentTypes.length > 0
            ? contentState.contentTypes[0].sys.id
            : "",
      },
      ".",
    ];

    // CONTENT
    this.content = (aiState: AIState, contentState: ContentState) => {
      const ctype = contentState.contentTypes?.find(
        (comp) => comp.sys.id === aiState.contextContentSelections["ctypeId"]
      );

      return `
${aiState.userContent}.
  
That content types full definition is:

\`\`\`
${JSON.stringify(ctype)}
\`\`\`

Create an example for each.
`;
    };

    this.responseContent = (response: string) =>
      `${response}
    
Make sure to take these suggestions and pass them to the tool in full!`;
  }
}
