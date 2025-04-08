import { ContentState } from "../../../../../contexts/ContentStateContext/ContentStateContext";
import { CREATE_COMPONENT_DEFINITION_TOOL_NAME } from "../../../../mcp/designSystemMCP/tools/createComponentDefinition/createComponentDefinition.tool";
import { AIPromptEngine } from "../../AIPromptEngine";
import {
  AIPromptConfig,
  AIPromptContextContentSelections,
} from "../../AIPromptEngineTypes";

export class CreateComponentDefinitionEngine extends AIPromptEngine {
  constructor(config: AIPromptConfig) {
    super(config);

    this.system = {
      role: "system",
      content: `
You are an expert in Design Systems and are helping guide a Solutions Engineer navigate creating a component definition.
This will be used as a base for creating all other kinds of UI components such as web components and Figma components.
Make sure to tell the SE what name and id you are going to use, but summarize the properties.
      
`,
    };
    this.toolType = "DemAIDesignSystem";
    this.toolFilters = [CREATE_COMPONENT_DEFINITION_TOOL_NAME];

    this.contextContent = (contentState: ContentState) => {
      let defaultComponentValue = "",
        componentOptions: string[] = [];
      if (contentState.components && contentState.components.length > 0) {
        defaultComponentValue = `\`${contentState.components[0].sys.id}\``;
        componentOptions =
          contentState.components?.map(
            (comp) => `\`${comp.sys.id}\`` || "unknown"
          ) || [];
      }
      return [
        "Create a Component Definition based on the ",
        {
          id: "componentId",
          options: componentOptions,
          defaultValue: defaultComponentValue,
        },
        "component.",
      ];
    };
    this.content = (
      userContent: string,
      contextContentSelections: AIPromptContextContentSelections,
      contentState: ContentState
    ) => {
      const compDefEntry = contentState.components?.find(
        (comp) => comp.sys.id === contextContentSelections["componentId"]
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
      }

      return `
${userContent}.
Use \`demai\` as the prefix for the component id. This will be used for the tag name in web components later.

If you do something design oriented, try to follow the patterns in these css variables from the design system.
Do not accept css variables as arguments, but use them to take abstract arguments...like "primary" or "secondary".
The actual implementation will deal with mapping to actuall css variables.
      
\`\`\`
${contentState.ai}
\`\`\`

`;
    };

    this.introMessage =
      "Let's create a component definition, what would you like to create?";

    this.executionPrompt = "Creating a component definition...";
    this.placeholder = "Describe what you want this component to do...";
  }
}
