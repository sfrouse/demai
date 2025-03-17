import { ContentfulClientApi, Entry } from "contentful";

/**
 * Fetches a Contentful entry by its ID.
 * @param client - The Contentful client instance.
 * @param entryId - The ID of the entry to fetch.
 * @param locale - The locale to retrieve the entry in.
 * @returns The entry if found, otherwise null.
 */
import { EntrySkeletonType } from "contentful";

export default async function getContentfulEntryById<
  T extends EntrySkeletonType,
>(
  client: ContentfulClientApi<undefined>,
  entryId: string,
  locale: string
): Promise<Entry<T> | null> {
  try {
    const entry = await client.getEntry<T>(entryId, { locale });
    return entry;
  } catch (error: any) {
    if (error?.sys?.id === "NotFound") {
      console.warn(`Entry with ID "${entryId}" not found.`);
      return null;
    }
    console.error("Error fetching Contentful entry:", error);
    throw error;
  }
}
