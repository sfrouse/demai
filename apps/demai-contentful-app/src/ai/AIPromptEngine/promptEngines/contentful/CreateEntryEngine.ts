import { ContentState } from "../../../../contexts/ContentStateContext/ContentStateContext";
import contentTypeToAI from "../../../AIState/utils/contentTypeToAI";
import { AIPromptEngine } from "../../AIPromptEngine";
import {
  AIPromptConfig,
  AIPromptContextContentSelections,
} from "../../AIPromptEngineTypes";

const CONTEXT_NUMBER_OF_TYPES = "numberOfCTypes";
const CONTEXT_CTYPE_ID = "ctypeId";
const CONTEXT_TONE_AND_STYLE = "toneAndStyle";
const CONTEXT_TONE_AND_STYLE_BRAND = "the prospect";
const CONTEXT_TONE_AND_STYLE_DESCRIPTION = "my description";

export class CreateEntryEngine extends AIPromptEngine {
  constructor(config: AIPromptConfig) {
    super(config);

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
        id: CONTEXT_NUMBER_OF_TYPES,
        options: ["1", "2", "3", "4", "5", "6"],
        defaultValue: "1",
      },
      "entries of content type:",
      {
        id: CONTEXT_CTYPE_ID,
        options: contentState.contentTypes?.map((ctype) => ctype.sys.id) || [],
        labels: contentState.contentTypes?.map((ctype) => ctype.name) || [],
        defaultValue:
          contentState.contentTypes && contentState.contentTypes.length > 0
            ? contentState.contentTypes[0].sys.id
            : "",
      },
      ".",
      "[BREAK]",
      "Use style and tone from",
      {
        id: CONTEXT_TONE_AND_STYLE,
        options: [
          CONTEXT_TONE_AND_STYLE_BRAND,
          CONTEXT_TONE_AND_STYLE_DESCRIPTION,
        ],
        defaultValue: CONTEXT_TONE_AND_STYLE_BRAND,
      },
    ];

    // CONTENT
    this.content = (
      userContent: string,
      contextContentSelections: AIPromptContextContentSelections,
      contentState: ContentState
    ) => {
      const ctype = contentState.contentTypes?.find(
        (comp) => comp.sys.id === contextContentSelections[CONTEXT_CTYPE_ID]
      );
      const useBrand =
        contextContentSelections[CONTEXT_TONE_AND_STYLE] ===
        CONTEXT_TONE_AND_STYLE_BRAND;

      return `
${userContent}.
  
That content types full definition is:

\`\`\`
${JSON.stringify(contentTypeToAI(ctype))}
\`\`\`

Create an example for each.

${
  useBrand &&
  `
The brand description is:

\`\`\`
${contentState.research?.fields.description}
\`\`\`

The brand product is:

\`\`\`
${contentState.research?.fields.products}
\`\`\`


The brand style is:

\`\`\`
${contentState.research?.fields.style}
\`\`\`

The brand tone is:

\`\`\`
${contentState.research?.fields.tone}
\`\`\`
  
`
}
`;
    };

    this.responseContent = (response: string) => `${response}`;
  }
}
