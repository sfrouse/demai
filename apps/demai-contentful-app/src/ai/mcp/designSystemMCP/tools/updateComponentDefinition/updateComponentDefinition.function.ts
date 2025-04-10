import { DesignSystemMCPClient } from "../../DesignSystemMCPClient";
import createComponentDefinition from "../createComponentDefinition";

export default async function updateComponentDefinitionFunction(
  mcp: DesignSystemMCPClient,
  params: any
) {
  const entry = await createComponentDefinition.functionCall(mcp, params);
  return {
    content: [
      {
        type: "object",
        text: entry,
      },
    ],
  };
}
