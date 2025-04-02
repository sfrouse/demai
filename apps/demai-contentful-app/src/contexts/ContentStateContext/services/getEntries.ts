import { ContentfulClientApi } from "contentful";

export default async function getEntries(
  previewClient: ContentfulClientApi<undefined> | undefined
) {
  if (!previewClient) return null;
  try {
    const componentEntries = await previewClient.getEntries({ limit: 100 });

    return (componentEntries.items || [])
      .filter(
        (item) =>
          !item.sys.id.startsWith("demai-") && !item.sys.id.startsWith("dmai-")
      )
      .sort((a, b) => {
        return a.sys.id.localeCompare(b.sys.id);
      });
  } catch (error: any) {
    console.error("Error fetching DemAI Tokens:", error);
    return null;
  }
}
