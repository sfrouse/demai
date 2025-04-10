import { DEMAI_TOKENS_SINGLETON_ENTRY_ID } from "../../../ai/mcp/designSystemMCP/validate/ctypes/demaiTokensCType";
import { ContentfulClientApi } from "contentful";
import { AppError } from "../../ErrorContext/ErrorContext";

export default async function getLatestTokens(
  previewClient: ContentfulClientApi<undefined> | undefined,
  param: string = "source",
  addError: (err: AppError) => void
) {
  if (!previewClient) return null;
  try {
    const tokensEntry = await previewClient.getEntry(
      DEMAI_TOKENS_SINGLETON_ENTRY_ID
    );
    return tokensEntry.fields[param] || null;
  } catch (error: any) {
    addError &&
      addError({
        service: "Getting Latest Tokens",
        message: "Error fetching DemAI Tokens",
        details: `${error}`,
      });
    return null;
  }
}
