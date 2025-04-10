import { DEMAI_COMPONENT_CTYPE_ID } from "../../../ai/mcp/designSystemMCP/validate/ctypes/demaiComponentCType";
import { ContentfulClientApi } from "contentful";
import { AppError } from "../../ErrorContext/ErrorContext";

export default async function getComponents(
  previewClient: ContentfulClientApi<undefined> | undefined,
  addError?: (err: AppError) => void
) {
  if (!previewClient) return null;
  try {
    const componentEntries = await previewClient.getEntries({
      content_type: DEMAI_COMPONENT_CTYPE_ID,
    });

    return (componentEntries.items || []).sort((a, b) => {
      return a.sys.id.localeCompare(b.sys.id);
    });
  } catch (error: any) {
    console.error("Error fetching DemAI Tokens:", error);
    addError &&
      addError({
        service: "Getting Components",
        message: "Error getting components.",
        details: `${error}`,
      });
    return null;
  }
}
