import { createClient } from "contentful-management";
import { DEMAI_TOKENS_SINGLETON_ENTRY_ID } from "../../../ai/mcp/designSystemMCP/contentTypes/demaiTokensCType";
import { DEMAI_COMPONENT_CTYPE_ID } from "../../../ai/mcp/designSystemMCP/components/demaiComponentCType";
import ensureDemAITokensSingletonEntry from "../../../ai/mcp/designSystemMCP/contentTypes/tokenSingleton/ensureDemAITokensSingletonEntry";

export default async function getComponents(
  cma: string,
  spaceId: string,
  environmentId: string
) {
  await ensureDemAITokensSingletonEntry(cma, spaceId, environmentId);
  const client = createClient({ accessToken: cma });

  try {
    const space = await client.getSpace(spaceId);
    const environment = await space.getEnvironment(environmentId);

    // Retrieve the singleton entry
    const entry = await environment.getEntries({
      content_type: DEMAI_COMPONENT_CTYPE_ID,
    });
    return entry.items || [];
  } catch (error: any) {
    if (error.name === "NotFound") {
      console.error(
        `Singleton entry "${DEMAI_TOKENS_SINGLETON_ENTRY_ID}" not found.`
      );
      return [];
    }
    console.error("Error fetching DemAI Tokens:", error);
    return [];
  }
}
