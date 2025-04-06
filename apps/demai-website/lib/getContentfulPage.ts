import { ContentfulClientApi, Entry } from "contentful";

export default async function getContentfulPage(
  client: ContentfulClientApi<undefined>,
  locale: string,
  slug: string
): Promise<Entry<any> | null> {
  try {
    const pageResults = await client.getEntries<any>({
      content_type: "demai-controller",
      "fields.slug": `/${slug}`,
      limit: 1,
      include: 10,
      locale,
    });

    if (pageResults.total === 0) {
      console.log(`getContentfulPage.ts - no PAGEVIEW for slug "${slug}":`);
    }

    return pageResults.total === 1 ? pageResults.items[0] : null;
  } catch (error) {
    console.log(
      `getContentfulPage.ts - Error fetching PAGEVIEW for slug "${slug}":`
      // error
    );
    return null;
  }
}
