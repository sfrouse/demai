import { ContentfulClientApi, createClient } from "contentful";

export default async function getContentfulClient(
  spaceId: string,
  cda: string,
  cpa: string,
  environment: string,
  preview: boolean = false
): Promise<ContentfulClientApi<undefined> | false> {
  if (cda && cpa) {
    if (preview === true) {
      return createClient({
        space: spaceId,
        accessToken: cpa,
        host: "preview.contentful.com",
        environment,
        includeContentSourceMaps: true,
      });
    }
    return createClient({
      space: spaceId,
      accessToken: cda,
      environment,
    });
  }
  return false;
}
