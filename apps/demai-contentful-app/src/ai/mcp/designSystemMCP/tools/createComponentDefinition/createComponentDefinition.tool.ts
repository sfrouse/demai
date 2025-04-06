import { ChatCompletionTool } from "openai/resources/index.mjs";

export const CREATE_COMPONENT_DEFINITION_TOOL_NAME =
  "create_component_definition";

const createComponentDefinitionTool: ChatCompletionTool = {
  type: "function",
  function: {
    name: CREATE_COMPONENT_DEFINITION_TOOL_NAME,
    description:
      "Creates a component definition that describes the interface for any kind of UI component such as a web component or Figma component.",
    parameters: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description:
            "The unique identifier for the component definition. It should lowercase, only letters and hyphens and always have a consistent prefix.",
        },
        name: {
          type: "string",
          description:
            "A unique name of the component in a more user friendly way. It should generally be the id but with spaces and capital case.",
        },
        description: {
          type: "string",
          description:
            "A description of what the component is and why you would use it.",
        },
        properties: {
          type: "array",
          description:
            "Array of properties that describe the interface for the UI component",
          items: {
            type: "object",
            properties: {
              id: {
                type: "string",
                description:
                  "Unique relative to other properties, lowercase, no spaces, using letters or hyphens only that identifies this property.",
              },
              title: {
                type: "string",
                description:
                  "The title of the property. Only allow alpha characters.",
              },
              type: {
                type: "string",
                description:
                  "Describes what type of property it is (string, number, integer, boolean, object, array, null)",
                enum: [
                  "string",
                  "number",
                  "integer",
                  "boolean",
                  "object",
                  "array",
                  "null",
                ],
              },
              description: {
                type: "string",
                description: "Describes what the property is for.",
              },
              enum: {
                type: "array",
                description:
                  "If the property is limited to a specific set of strings, this defines them. An example would be like design should only be 'primary' or 'secondary'.",
                items: {
                  type: "string",
                },
              },
              defaultValue: {
                type: "string",
                description:
                  "If a default value makes sense, this will define it.",
              },
            },
            additionalProperties: false,
            required: [
              "id",
              "title",
              "type",
              "description",
              "enum",
              "defaultValue",
            ],
          },
          additionalProperties: false,
          required: ["items"],
        },
      },
      additionalProperties: false,
      required: ["id", "name", "description", "properties"],
    },
  },
};

export default createComponentDefinitionTool;
