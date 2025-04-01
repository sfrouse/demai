import { DEMAI_COMPONENT_CTYPE_ID } from "../../../ai/mcp/designSystemMCP/validate/ctypes/demaiComponentCType";
import { ContentfulClientApi } from "contentful";

export default async function getComponents(
  previewClient: ContentfulClientApi<undefined> | undefined
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
    return null;
  }
}
