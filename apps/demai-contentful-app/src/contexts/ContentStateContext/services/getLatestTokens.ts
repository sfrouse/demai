import { DEMAI_TOKENS_SINGLETON_ENTRY_ID } from "../../../ai/mcp/designSystemMCP/validate/ctypes/demaiTokensCType";
import { ContentfulClientApi } from "contentful";

export default async function getLatestTokensVia(
  previewClient: ContentfulClientApi<undefined> | undefined,
  param: string = "source"
) {
  if (!previewClient) return null;
  try {
    const tokensEntry = await previewClient.getEntry(
      DEMAI_TOKENS_SINGLETON_ENTRY_ID
    );

    return tokensEntry.fields[param] || null;
  } catch (error: any) {
    console.error("Error fetching DemAI Tokens:", error);
    return null;
  }
}
