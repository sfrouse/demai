import { ContentfulClientApi } from "contentful";
import { AppError } from "../../ErrorContext/ErrorContext";

export default async function getEntries(
  previewClient: ContentfulClientApi<undefined> | undefined,
  addError: (err: AppError) => void
) {
  if (!previewClient) return null;
  try {
    const componentEntries = await previewClient.getEntries({ limit: 100 });
    console.log("componentEntries", componentEntries);
    return (componentEntries.items || [])
      .filter(
        (item) =>
          !item.sys.id.startsWith("demai-") && !item.sys.id.startsWith("dmai-")
      )
      .sort((a, b) => {
        return a.sys.id.localeCompare(b.sys.id);
      });
  } catch (error: any) {
    addError &&
      addError({
        service: "Getting Entries",
        message: "Error fetching DemAI Tokens",
        details: `${error}`,
      });
    return null;
  }
}
