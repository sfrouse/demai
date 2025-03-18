import { createClient } from "contentful-management";
import { DEMAI_TOKENS_SINGLETON_ENTRY_ID } from "../../../../ai/mcp/designSystemMCP/contentTypes/demaiTokensCType";
import ensureDemAITokensSingletonEntry from "../../../../ai/mcp/designSystemMCP/contentTypes/tokenSingleton/ensureDemAITokensSingletonEntry";

export default async function getLatestTokens(
  cma: string,
  spaceId: string,
  environmentId: string,
  param: string = "source"
) {
  await ensureDemAITokensSingletonEntry(cma, spaceId, environmentId);
  const client = createClient({ accessToken: cma });

  try {
    const space = await client.getSpace(spaceId);
    const environment = await space.getEnvironment(environmentId);

    // Retrieve the singleton entry
    const entry = await environment.getEntry(DEMAI_TOKENS_SINGLETON_ENTRY_ID);
    return entry.fields[param]?.["en-US"] || null;
  } catch (error: any) {
    if (error.name === "NotFound") {
      console.error(
        `Singleton entry "${DEMAI_TOKENS_SINGLETON_ENTRY_ID}" not found.`
      );
      return null;
    }
    console.error("Error fetching DemAI Tokens:", error);
    return null;
  }
}
