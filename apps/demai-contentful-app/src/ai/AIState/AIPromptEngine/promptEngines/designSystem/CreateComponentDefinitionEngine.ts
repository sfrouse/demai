import { ContentState } from "../../../../../locations/page/ContentStateContext/ContentStateContext";
import AIState from "../../../AIState";
import { AIPromptEngine } from "../../AIPromptEngine";
import * as icons from "@contentful/f36-icons";

export class CreateComponentDefinitionEngine extends AIPromptEngine {
  constructor(aiState: AIState) {
    super(aiState);

    // this.system = {
    //   role: "system",
    //   content: `You are an expert in Design Systems and are helping guide a Solutions Engineer navigate creating a component definition.
    //   This will be used as a base for creating all other kinds of UI components such as web components and Figma components.
    //   Make sure to tell the SE what name and id you are going to use, but summarize the properties.`,
    // };
    this.system = {
      role: "system",
      content: `You are an expert in Design Systems and are helping guide a Solutions Engineer navigate creating a web component based on a component definition.
      Make sure to tell the SE what name and id you are going to use, but summarize the properties.`,
    };
    this.toolType = "DemAIDesignSystem";

    this.contextContent = (contentState: ContentState) => {
      let defaultComponentValue = "",
        componentOptions: string[] = [];
      if (contentState.components && contentState.components.length > 0) {
        defaultComponentValue = contentState.components[0].sys.id;
        componentOptions =
          contentState.components?.map((comp) => comp.sys.id || "unknown") ||
          [];
      }
      return [
        "Create",
        {
          id: "action",
          options: ["Definition", "Web Component", "Bindings"],
          defaultValue: "Definition",
          paths: [
            [
              "based on a",
              {
                id: "componentType",
                options: ["Button", "Hero", "Card"],
                defaultValue: "Button",
              },
              "component. Use 'dmai' as the prefix.",
            ],
            [
              "for",
              {
                id: "componentId",
                options: componentOptions,
                defaultValue: defaultComponentValue,
              },
              "component.",
            ],
            [
              "using these content types (...)",
              "and also includes the following:",
            ],
          ],
        },
      ];
    };
    this.content = (aiState: AIState, contentState: ContentState) => {
      let extraPrompt = "";
      if (aiState.contextContentSelections["action"] === "Web Component") {
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
      }

      // now add tokens...
      console.log("contentState", contentState);
      extraPrompt = `${extraPrompt}. Use only these css properties ( for example: "color: var( --dami-color-text);" ). Avoid using any property that is not a css variable. ${contentState.css}`;

      return `${aiState.userContent}. ${extraPrompt}`;
    };

    this.introMessage =
      "Let's create a component definition, what would you like to create?";

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
