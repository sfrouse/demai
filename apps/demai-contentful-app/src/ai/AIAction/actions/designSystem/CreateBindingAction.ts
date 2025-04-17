import { ContentType } from "contentful-management";
import { ContentState } from "../../../../contexts/ContentStateContext/ContentStateContext";
import { CREATE_BINDING_TOOL_NAME } from "../../../mcp/designSystemMCP/functions/createBinding";
import { AIActionConfig, AIActionSnapshot } from "../../AIActionTypes";
import { AIAction } from "../../AIAction";
import cDefToAI from "../../utils/cDefToAI";
import contentTypeToAI from "../../utils/contentTypeToAI";

export class CreateBindingAction extends AIAction {
    static label = "Create Bindings";

    static BINDING_CTYPE_ACTION = "ctypeId";
    static BINDING_COMPONENT_ACTION = "componentId";

    async loadNeededData() {
        await this.loadProperty("contentTypes");
        await this.loadProperty("components");
    }

    async postExeDataUpdates(): Promise<void> {
        await this.loadProperty("components", true);
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

You are an expert in Design Systems and Contentful and are helping guide a Solutions Engineer navigate creating a binding file between a Conentful content type and a component definition.
Sometimes you will be asked to bind a content type that doesn't necessarily align with the view which is fine, do the best you can.
Just make sure that the types of data are the same on both sides, boolean to boolean, text to text, etc.

`,
        };
        this.toolType = "DemAIDesignSystem";
        this.toolFilters = [CREATE_BINDING_TOOL_NAME];

        this.contextContent = (contentState: ContentState) => {
            let defaultComponentValue = "",
                componentOptions: string[] = [];
            if (contentState.components && contentState.components.length > 0) {
                defaultComponentValue = `${contentState.components[0].sys.id}`;
                componentOptions =
                    contentState.components?.map(
                        (comp) => `${comp.sys.id}` || "unknown",
                    ) || [];
            }

            let defaultCTypeValue = "",
                contentTypeOptions: string[] = [];
            if (
                contentState.contentTypes &&
                contentState.contentTypes.length > 0
            ) {
                defaultCTypeValue = `${contentState.contentTypes[0].sys.id}`;
                contentTypeOptions =
                    contentState.contentTypes?.map(
                        (ctype) => `${ctype.sys.id}` || "unknown",
                    ) || [];
            }
            return [
                "Create a binding between ",
                {
                    id: CreateBindingAction.BINDING_COMPONENT_ACTION,
                    options: componentOptions,
                    defaultValue: defaultComponentValue,
                },
                "component and this content type",
                {
                    id: CreateBindingAction.BINDING_CTYPE_ACTION,
                    options: contentTypeOptions,
                    defaultValue: defaultCTypeValue,
                },
            ];
        };
        this.content = (contentState: ContentState) => {
            const component = contentState.components?.find(
                (comp) =>
                    comp.sys.id ===
                    this.contextContentSelections[
                        CreateBindingAction.BINDING_COMPONENT_ACTION
                    ],
            );
            const contentType = contentState.contentTypes?.find(
                (ct: ContentType) =>
                    ct.sys.id ===
                    this.contextContentSelections[
                        CreateBindingAction.BINDING_CTYPE_ACTION
                    ],
            );

            console.log("contentType", contentType);

            const cDef = component?.fields.componentDefinition
                ? component.fields.componentDefinition
                : null;

            const prompt = `
      
${this.userContent}
    
Here is the content type:

\`\`\`
${contentType ? JSON.stringify(contentTypeToAI(contentType)) : ""}
\`\`\`

Here is the component definition:

\`\`\`
${component ? JSON.stringify(cDefToAI(cDef)) : ""}
\`\`\`

`;
            return prompt;
        };

        this.introMessage =
            "Let's create a binding between a web component and a content type, what would you like to create?";

        this.executionPrompt = "Creating a binding...";
        this.placeholder = "Describe any adjustments you'd like to make...";
    }
}
