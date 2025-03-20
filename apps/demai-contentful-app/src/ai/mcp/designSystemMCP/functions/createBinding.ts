import { createClient, Entry } from "contentful-management";
import { IMCPTool } from "../../IMCPClient";
import ensureDemAIComponentEntry from "../components/ensureDemAIComponentEntry";
import { DesignSystemMCPClient } from "../DesignSystemMCPClient";

export const CREATE_BINDING_TOOL_NAME = "create_binding";

const createBinding: IMCPTool = {
  toolName: CREATE_BINDING_TOOL_NAME,
  tool: {
    type: "function",
    function: {
      name: CREATE_BINDING_TOOL_NAME,
      description:
        "Creates a component definition that describes the interface for any kind of UI component such as a web component or Figma component.",
      parameters: {
        type: "object",
        properties: {
          modelId: {
            type: "string",
            description:
              "The id of the content type (here a model relative to MVC pattern) that is to be bound to the component definition (the view) in the configuration.",
          },
          viewId: {
            type: "string",
            description:
              "The id of the component definition (here a view relative to MVC pattern) that is to be bound to the content type in the configuration.",
          },
          default: {
            type: "boolean",
            description:
              "Indicates that this view is the default view for the model. Generally the default view and model have similar ids or names.",
          },
          bindings: {
            type: "array",
            description: "The list of bindings between the model and the view.",
            items: {
              type: "object",
              properties: {
                model: {
                  type: "string",
                  description:
                    "The id of the model property that is to be bound to the view.",
                },
                view: {
                  oneOf: [
                    {
                      type: "string",
                      description:
                        "The id of the view property to bind to the model.",
                    },
                    {
                      type: "object",
                      properties: {
                        replace: { type: "boolean" },
                      },
                      required: ["replace"],
                      description:
                        "Indicates a full replacement of the focused model with the model found in this view's property. When a content type (model) has a property like 'override' it should be used as a replacement.",
                    },
                    {
                      type: "object",
                      properties: {
                        slot: {
                          type: "string",
                          description:
                            "The name of the slot to inject the model property into.",
                        },
                      },
                      required: ["slot"],
                      description:
                        "Indicates that the model property should be injected into a slot in the view.",
                    },
                  ],
                },
              },
            },
          },
        },
        required: ["modelId", "name", "properties"],
      },
    },
  },
  functionCall: async (mcp: DesignSystemMCPClient, params: any) => {
    console.log("mcp, params", mcp, params);

    let finalBindings: any[] = [];
    try {
      const client = createClient({ accessToken: mcp.cma });
      const space = await client.getSpace(mcp.spaceId);
      const environment = await space.getEnvironment(mcp.environmentId);
      let viewEntry: Entry = await environment.getEntry(params.viewId);

      // find the previous bindings, make sure this doesn't already exist and if it does, update it
      const bindings = viewEntry?.fields.bindings
        ? viewEntry?.fields.bindings["en-US"]
        : null;
      if (bindings) {
        finalBindings = updateBindings(bindings, params);
      } else {
        finalBindings.push(params);
      }
    } catch (error) {
      console.error("Error finding DemAI component entry:", error);
    }

    await ensureDemAIComponentEntry(
      mcp.cma,
      mcp.spaceId,
      mcp.environmentId,
      params.viewId,
      {
        bindings: finalBindings,
      }
    );

    console.log("finalBindings", finalBindings);

    return {
      content: [
        {
          type: "object",
          text: JSON.stringify(finalBindings),
        },
      ],
    };
  },
};

interface Binding {
  model: string;
  view: string;
}

interface ModelBinding {
  modelId: string;
  viewId: string;
  bindings: Binding[];
}

function updateBindings(
  bindingsArray: ModelBinding[],
  newBinding: ModelBinding
): ModelBinding[] {
  return [
    ...bindingsArray.filter(
      (b) =>
        !(b.modelId === newBinding.modelId && b.viewId === newBinding.viewId)
    ),
    newBinding, // Add the new binding (removes old one if it existed)
  ];
}

export default createBinding;
