import { ContentState } from "../../../../contexts/ContentStateContext/ContentStateContext";
import { AIAction } from "../../AIAction";
import { AIActionConfig, AIActionSnapshot } from "../../AIActionTypes";
import contentTypeToAI from "../../utils/contentTypeToAI";

export class CreateEntryAction extends AIAction {
    static label = "Create Entries";

    static CONTEXT_NUMBER_OF_TYPES = "numberOfCTypes";
    static CONTEXT_CTYPE_ID = "ctypeId";

    static CONTEXT_TONE_AND_STYLE = "toneAndStyle";
    static CONTEXT_TONE_AND_STYLE_BRAND = "the prospect";
    static CONTEXT_TONE_AND_STYLE_DESCRIPTION = "my description";
    static CONTEXT_TONE_AND_STYLE_OPTIONS = [
        CreateEntryAction.CONTEXT_TONE_AND_STYLE_BRAND,
        CreateEntryAction.CONTEXT_TONE_AND_STYLE_DESCRIPTION,
    ];
    static CONTEXT_TONE_AND_STYLE_DEFAULT =
        CreateEntryAction.CONTEXT_TONE_AND_STYLE_BRAND;

    async loadNeededData() {
        await this.loadProperty("contentTypes");
        await this.loadProperty("research");
    }

    async postExeDataUpdates(): Promise<void> {
        await this.loadProperty("entries", true);
    }

    constructor(
        config: AIActionConfig,
        getContentState: () => ContentState,
        loadProperty: (key: keyof ContentState, forceRefresh?: boolean) => void,
        snapshotOverrides?: Partial<AIActionSnapshot>,
    ) {
        super(config, getContentState, loadProperty, snapshotOverrides);

        this.introMessage =
            "Let’s create some entries, what would you like to do?";
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
                id: CreateEntryAction.CONTEXT_NUMBER_OF_TYPES,
                options: ["1", "2", "3", "4", "5", "6"],
                defaultValue: "1",
            },
            "entries of content type:",
            {
                id: CreateEntryAction.CONTEXT_CTYPE_ID,
                options:
                    contentState.contentTypes?.map((ctype) => ctype.sys.id) ||
                    [],
                labels:
                    contentState.contentTypes?.map((ctype) => ctype.name) || [],
                defaultValue:
                    contentState.contentTypes &&
                    contentState.contentTypes.length > 0
                        ? contentState.contentTypes[0].sys.id
                        : "",
            },
            ".",
            "[BREAK]",
            "Use style and tone from",
            {
                id: CreateEntryAction.CONTEXT_TONE_AND_STYLE,
                options: CreateEntryAction.CONTEXT_TONE_AND_STYLE_OPTIONS,
                defaultValue: CreateEntryAction.CONTEXT_TONE_AND_STYLE_DEFAULT,
            },
        ];

        // CONTENT
        this.content = (contentState: ContentState) => {
            const ctype = contentState.contentTypes?.find(
                (comp) =>
                    comp.sys.id ===
                    this.contextContentSelections[
                        CreateEntryAction.CONTEXT_CTYPE_ID
                    ],
            );
            const useBrand =
                this.contextContentSelections[
                    CreateEntryAction.CONTEXT_TONE_AND_STYLE
                ] === CreateEntryAction.CONTEXT_TONE_AND_STYLE_BRAND;

            return `
${this.userContent}.
  
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
