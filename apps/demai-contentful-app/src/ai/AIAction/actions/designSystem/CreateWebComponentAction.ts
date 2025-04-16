import { ContentState } from "../../../../contexts/ContentStateContext/ContentStateContext";
import { CREATE_WEB_COMPONENT_TOOL_NAME } from "../../../mcp/designSystemMCP/functions/createWebComponent";
import { AIAction } from "../../AIAction";
import { AIActionConfig, AIActionSnapshot } from "../../AIActionTypes";

export class CreateWebComponentAction extends AIAction {
    static label = "Create Web Component";

    async loadNeededData() {
        await this.loadProperty("tokens");
        await this.loadProperty("research");
    }

    constructor(
        config: AIActionConfig,
        contentChangeEvent: () => void,
        getContentState: () => ContentState,
        loadProperty: (key: keyof ContentState, forceRefresh?: boolean) => void,
        snapshotOverrides?: Partial<AIActionSnapshot>,
    ) {
        super(
            config,
            contentChangeEvent,
            getContentState,
            loadProperty,
            snapshotOverrides,
        );

        this.system = {
            role: "system",
            content: `
You are an expert in Design Systems and are helping guide a Solutions Engineer navigate creating a web component based on a component definition.
The web compontent should be entirely self contained and contain only JavaScript. 
Use LitElements package to create the web component.
There should be NO TypeScript or anything that requires TypeScript such as decorators.
Do not create another component definition, create ONLY a web component using the component definition.

`,
        };
        this.toolType = "DemAIDesignSystem";
        this.toolFilters = [CREATE_WEB_COMPONENT_TOOL_NAME];
        this.introMessage =
            "Let's create a web component, what would you like to create?";
        this.executionPrompt = "Creating a component definition...";
        this.placeholder = "Describe what you want this component to do...";

        // ======= CONTENT CONTEXT ========
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
            return [
                "Create a Web Component based on the",
                {
                    id: "componentId",
                    options: componentOptions,
                    defaultValue: defaultComponentValue,
                },
                "component definition.",
            ];
        };

        // ======= CONTENT ========
        this.content = (contentState: ContentState) => {
            let extraPrompt = "";
            const compDefEntry = contentState.components?.find(
                (comp) =>
                    comp.sys.id ===
                    this.contextContentSelections["componentId"],
            );
            if (compDefEntry && compDefEntry.fields?.componentDefinition) {
                const compDef = compDefEntry.fields?.componentDefinition;
                const attributes: any[] = [];
                Object.entries(compDef.properties).map((prop) => {
                    const name = prop[0];
                    const propObj = prop[1] as any;
                    if (["$schema", "$identifier"].includes(name)) return;
                    attributes.push({
                        name,
                        type: propObj.type,
                        enum: propObj.enum,
                    });
                });
                const compDefSimple = {
                    tag: compDef["x-cdef"]?.tag,
                    attributes,
                };
                extraPrompt = `
        
Base the web component on this component definition:

\`\`\`        
${JSON.stringify(compDefSimple)}
\`\`\`

`;
            }

            // now add tokens...
            extraPrompt = `${extraPrompt}

Use 'demai' as the prefix. Use only these css properties ( for example: \`color: var( --dami-text-default );\` ).
Avoid using any property that is not a css variable, these are all the variable names:

\`\`\`
${contentState.ai}
\`\`\`

`;

            return `${this.userContent}. ${extraPrompt}`;
        };
    }
}
