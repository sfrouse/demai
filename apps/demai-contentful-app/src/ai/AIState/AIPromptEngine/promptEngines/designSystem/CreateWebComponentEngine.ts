import { ContentState } from "../../../../../contexts/ContentStateContext/ContentStateContext";
import { CREATE_WEB_COMPONENT_TOOL_NAME } from "../../../../mcp/designSystemMCP/functions/createWebComponent";
import AIState from "../../../AIState";
import { AIPromptEngine } from "../../AIPromptEngine";
import * as icons from "@contentful/f36-icons";

export class CreateWebComponentEngine extends AIPromptEngine {
  constructor(aiState: AIState) {
    super(aiState);

    this.system = {
      role: "system",
      content: `You are an expert in Design Systems and are helping guide a Solutions Engineer navigate creating a web component based on a component definition.
      The web compontent should be entirely self contained and contain only JavaScript code.`,
    };
    this.toolType = "DemAIDesignSystem";
    this.toolFilters = [CREATE_WEB_COMPONENT_TOOL_NAME];

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
        "Create a Web Component based on the",
        {
          id: "componentId",
          options: componentOptions,
          defaultValue: defaultComponentValue,
        },
        "component.",
      ];
    };
    this.content = (aiState: AIState, contentState: ContentState) => {
      let extraPrompt = "";
      const compDefEntry = contentState.components?.find(
        (comp) =>
          comp.sys.id === aiState.contextContentSelections["componentId"]
      );
      if (compDefEntry && compDefEntry.fields?.componentDefinition) {
        const compDef = compDefEntry.fields?.componentDefinition["en-US"];
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
        extraPrompt = `Do not create another component definition, create ONLY a web component using this component definition: ${JSON.stringify(
          compDefSimple
        )}`;
      }

      // now add tokens...
      extraPrompt = `${extraPrompt}. Use 'dmai' as the prefix. Use only these css properties ( for example: \`color: var( --dami-text-default );\` ).
      Avoid using any property that is not a css variable, these are all the variable names:

\`\`\`
${contentState.ai}
\`\`\``;

      return `${aiState.userContent}. ${extraPrompt}`;
    };

    this.introMessage =
      "Let's create a web component, what would you like to create?";

    this.executionPrompt = "Creating a component definition...";
    this.placeholder = "Describe what you want this component to do...";

    this.prompts = {
      cancel: "Nope, Let's Rethink",
      run: "Yes, Let's Create This",
      cancelIcon: icons.DeleteIcon,
      runIcon: icons.StarIcon,
    };
  }
}
