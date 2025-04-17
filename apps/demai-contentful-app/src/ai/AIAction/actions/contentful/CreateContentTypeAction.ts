import OpenAI from "openai";
import { ContentState } from "../../../../contexts/ContentStateContext/ContentStateContext";
import { AppError } from "../../../../contexts/ErrorContext/ErrorContext";
import { DEMAI_GENERATED_PROPERTY_IDENTIFIER } from "../../../../constants";
import { AIAction } from "../../AIAction";
import {
    AIActionConfig,
    AIActionExecuteResults,
    AIActionPhase,
    AIActionSnapshot,
} from "../../AIActionTypes";
import { EditContentTypeAction } from "./EditContentTypeAction";

export class CreateContentTypeAction extends AIAction {
    static label = "Create Content Types";

    // IDs
    static ACTION_CREATE_CTYPES_ID = "numberOfCTypes";
    static ACTION_CREATE_CTYPES_OPTIONS = ["1", "2", "3", "4", "5", "6"];
    static ACTION_CREATE_CTYPES_DEFAULT = "1";

    static SOURCE_RESEARCH_ID = "sourceResearch";
    static SOURCE_RESEARCH_OPTIONS_PROSPECT = "the prospect";
    static SOURCE_RESEARCH_OPTIONS_DESCRIPTION = "following description";
    static SOURCE_RESEARCH_OPTIONS = [
        CreateContentTypeAction.SOURCE_RESEARCH_OPTIONS_PROSPECT,
        CreateContentTypeAction.SOURCE_RESEARCH_OPTIONS_DESCRIPTION,
    ];
    static SOURCE_RESEARCH_DEFAULT =
        CreateContentTypeAction.SOURCE_RESEARCH_OPTIONS_PROSPECT;

    async loadNeededData() {
        await this.loadProperty("research");
    }

    async postExeDataUpdates(): Promise<void> {
        await this.loadProperty("contentTypes", true);
    }

    constructor(
        config: AIActionConfig,
        getContentState: () => ContentState,
        loadProperty: (key: keyof ContentState, forceRefresh?: boolean) => void,
        snapshotOverrides?: Partial<AIActionSnapshot>,
    ) {
        super(config, getContentState, loadProperty, snapshotOverrides);

        this.system = {
            role: "system",
            content: `
You are an expert in Contentful, help this SE learn about Contentful demos.
If you find that a tool would be useful, render that tool name in the output.
`,
        };
        this.toolType = "Contentful";
        this.toolFilters = ["create_content_type", "publish_content_type"];

        this.contextContent = () => [
            "Create",
            {
                id: CreateContentTypeAction.ACTION_CREATE_CTYPES_ID,
                options: CreateContentTypeAction.ACTION_CREATE_CTYPES_OPTIONS,
                defaultValue:
                    CreateContentTypeAction.ACTION_CREATE_CTYPES_DEFAULT,
            },
            "content types from",
            {
                id: CreateContentTypeAction.SOURCE_RESEARCH_ID,
                options: CreateContentTypeAction.SOURCE_RESEARCH_OPTIONS,
                defaultValue: CreateContentTypeAction.SOURCE_RESEARCH_DEFAULT,
            },
        ];
        this.introMessage =
            "Let’s work with Content Types, what would you like to do?";

        this.executionPrompt = "Creating your Content Types...";
        this.placeholder =
            "Describe the kind of content type you would like. Try to be descriptive...";

        this.content = (contentState: ContentState) => {
            const useBrand =
                this.contextContentSelections[
                    CreateContentTypeAction.SOURCE_RESEARCH_ID
                ] === CreateContentTypeAction.SOURCE_RESEARCH_OPTIONS_PROSPECT;

            return `
${this.userContent}.

${
    useBrand &&
    `

Create content types that would make sense for a website talking about this brand. 

The brand description is:

\`\`\`
${contentState.research?.fields.description}
\`\`\`

The brand product is:

\`\`\`
${contentState.research?.fields.products}
\`\`\`

  `
}
      `;
        };
    }

    preprocessToolRequest(
        tool: OpenAI.Chat.Completions.ChatCompletionMessageToolCall,
        addError: (err: AppError) => void,
    ): OpenAI.Chat.Completions.ChatCompletionMessageToolCall {
        try {
            const args = JSON.parse(tool.function.arguments);
            if (args.fields) {
                args.fields.push({
                    id: DEMAI_GENERATED_PROPERTY_IDENTIFIER,
                    name: DEMAI_GENERATED_PROPERTY_IDENTIFIER,
                    type: "Boolean",
                    omitted: true,
                    disabled: true,
                    defaultValue: {
                        "en-US": true,
                    },
                });
            }
            return {
                ...tool,
                function: {
                    ...tool.function,
                    arguments: JSON.stringify(args),
                },
            };
        } catch (err) {
            addError({
                service: "Preprocessing Content Type",
                message:
                    "CreateContentTypeAction had an issue preprocessing tool",
                details: `${err}`,
            });
            return tool;
        }
    }

    async runExe(
        addError: (err: AppError) => void,
    ): Promise<AIActionExecuteResults> {
        const results = await super.runExe(addError);
        if (results.success === true) {
            this.updateSnapshot({
                isRunning: true,
                startExecutionRunTime: Date.now(),
            });
            const newContentType = results.toolResults?.[0]?.content?.[0]?.text;
            let newContentTypeId;
            if (newContentType) {
                try {
                    const newContentTypeObj = JSON.parse(newContentType);
                    newContentTypeId = newContentTypeObj.sys.id;
                } catch {}
            }
            await this.runExeChildAction(
                new EditContentTypeAction(
                    this.config,
                    this.getContentState,
                    this.loadProperty,
                    {
                        response: `publish the content type with id ${newContentTypeId}`,
                    },
                ),
                addError,
            );

            this.updateSnapshot({
                isRunning: false,
                phase: AIActionPhase.executed,
                executeRunTime: Date.now() - this.startExecutionRunTime!,
            });
            return results;
        } else {
            return results;
        }
    }
}
