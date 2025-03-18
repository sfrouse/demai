import { IMCPTool } from "../../IMCPClient";
import ensureDemAIComponentEntry from "../components/ensureDemAIComponentEntry";
import { DesignSystemMCPClient } from "../DesignSystemMCPClient";

const toolName = "create_web_component";

const createWebComponent: IMCPTool = {
  toolName,
  tool: {
    type: "function",
    function: {
      name: toolName,
      description:
        "Creates an HTML5 self contained web component using lit elements.",
      parameters: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description:
              "The unique identifier for the web component. It should lowercase, only letters and hyphens and always have a consistent prefix.",
          },
          code: {
            type: "string",
            description:
              "The actual JavaScript that can execute on it's own. It should have the customElements.define statement at the end using the name.",
          },
        },
        required: ["name", "code"],
      },
    },
  },
  functionCall: async (mcp: DesignSystemMCPClient, params: any) => {
    console.log("createWebComponent", mcp, params);

    await ensureDemAIComponentEntry(
      mcp.cma,
      mcp.spaceId,
      mcp.environmentId,
      params.id,
      {
        // title: params.name,
        // description: params.description,
        // componentDefinition: cDef,
        javascript: params.code,
        // binding: { event: "click", action: "alert('Clicked!')" },
      }
    );

    return {
      content: [
        {
          type: "object",
          text: ``, // `${JSON.stringify(cDef)}`,
        },
      ],
    };
  },
};

export default createWebComponent;
