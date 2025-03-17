import { STUDIO_EXPERIENCE_CONTENT_TYPE } from "@/constants/global";
import { ContentfulClientApi, Entry } from "contentful";

// Fetch page function
export default async function getContentfulExperience(
  client: ContentfulClientApi<undefined>,
  locale: string,
  slug: string
): Promise<Entry<any> | null> {
  try {
    const experienceResults = await client.getEntries<any>({
      content_type: STUDIO_EXPERIENCE_CONTENT_TYPE,
      "fields.slug": slug,
      locale,
      limit: 1,
      include: 10,
    });

    return experienceResults.total === 1 ? experienceResults.items[0] : null;
  } catch (error) {
    console.log(
      `getContentfulExperience.ts - No EXPERIENCE for slug "${slug}":`
      // error
    );
    return null;
  }
}
