import { ContentState } from "../../../../contexts/ContentStateContext/ContentStateContext";
import cDefToAI from "../../../AIState/utils/cDefToAI";
import { UPDATE_COMPONENT_DEFINITION_TOOL_NAME } from "../../../mcp/designSystemMCP/tools/updateComponentDefinition/updateComponentDefinition.tool";
import { AIAction } from "../../AIAction";
import { AIActionConfig, AIActionSnapshot } from "../../AIActionTypes";

const EDIT_COMP_ACTION = "compAction";
const EDIT_COMP_ACTION_DEFITION = "Component Definition";
const EDIT_COMP_ACTION_WEB_COMP = "Web Component";
const EDIT_COMP_ACTION_BINDING = "Binding";

export class EditComponentAction extends AIAction {
    static label = "Edit Comp Definition";

    constructor(
        config: AIActionConfig,
        snapshotOverrides?: Partial<AIActionSnapshot>,
    ) {
        super(config, snapshotOverrides);

        this.introMessage =
            "Let's edit this component definition, what would you like to do?";
        this.executionPrompt = "Creating a component definition...";
        this.placeholder = "Describe what you want this component to do...";

        // ENGINE
        this.system = {
            role: "system",
            content: `
You are an expert in Design Systems and are helping guide a Solutions Engineer navigate editing a component.
A component is made up of a definition, code, and bindings.    
`,
        };
        this.toolType = "DemAIDesignSystem";
        this.toolFilters = [UPDATE_COMPONENT_DEFINITION_TOOL_NAME];

        this.contextContent = (contentState: ContentState) => {
            return [
                "Edit the ",
                {
                    id: EDIT_COMP_ACTION,
                    options: [
                        EDIT_COMP_ACTION_DEFITION,
                        EDIT_COMP_ACTION_WEB_COMP,
                        EDIT_COMP_ACTION_BINDING,
                    ],
                    defaultValue: EDIT_COMP_ACTION_WEB_COMP,
                },
                "for this component.",
            ];
        };
        this.content = (contentState: ContentState) => {
            const comp = contentState.component;
            let compInfo = "";
            switch (this.contextContentSelections[EDIT_COMP_ACTION]) {
                case EDIT_COMP_ACTION_DEFITION: {
                    // need cDef to look like MCP version...
                    const mcpCDef = cDefToAI(comp?.fields.componentDefinition);

                    compInfo = `
Using the \`${UPDATE_COMPONENT_DEFINITION_TOOL_NAME}\` tool, you can edit the component definition and follow the format and instructions in the prompt.
If something else is missing, just add it, but don't let that stop you from fullfilling the prompt.
This is the component definition as it is now. 

\`\`\`
${JSON.stringify(mcpCDef, null, 2)}
\`\`\`

`;
                    break;
                }
                case EDIT_COMP_ACTION_WEB_COMP: {
                    const mcpCDef = cDefToAI(comp?.fields.componentDefinition);

                    compInfo = `
This is the web component as it is now: 

\`\`\`
${comp?.fields.javascript}
\`\`\`

Do not add any attributes or properties that don't exist in the component definition.
Here is the component definition:

\`\`\`
${JSON.stringify(mcpCDef, null, 2)}
\`\`\`

Use only these css properties ( for example: \`color: var( --demai-text-default );\` ).
Avoid using any property that is not a css variable, these are all the variable names:

\`\`\`
${contentState.ai}
\`\`\`

`;
                    break;
                }
                case EDIT_COMP_ACTION_BINDING: {
                    compInfo = `
These are the bindings as it is now: 

\`\`\`
${JSON.stringify(comp?.fields.bindings, null, 2)}
\`\`\`


`;
                    break;
                }
            }

            return `
${this.userContent}. ${compInfo}`;
        };
    }
}
