import { DesignSystemMCPClient } from "../../../designSystemMCP/DesignSystemMCPClient";
import { updateResearchSingleton } from "../utils/updateResearchSingleton";
import { DEMAI_RESEARCH_SINGLETON_ENTRY_ID } from "../../validate/ctypes/demaiResearchCType";

export default async function updateBrandColorsFunction(
  mcp: DesignSystemMCPClient,
  params: any
) {
  const entry = await updateResearchSingleton(
    mcp.cma,
    mcp.spaceId,
    mcp.environmentId,
    DEMAI_RESEARCH_SINGLETON_ENTRY_ID,
    {
      // title: params.name, // don't change...
      primaryColor: params.primary,
      secondaryColor: params.secondary,
      tertiaryColor: params.tertiary,
    }
  );

  return {
    content: [
      {
        type: "object",
        text: entry,
      },
    ],
  };
}
