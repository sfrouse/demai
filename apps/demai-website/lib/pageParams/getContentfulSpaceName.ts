import { SpaceParamsPartial } from "@/app/types";
import { createClient } from "contentful-management";

export default async function getContentfulSpaceName(
  spaceName?: string | string[]
): Promise<SpaceParamsPartial | undefined> {
  const spaceNames = Array.isArray(spaceName) ? spaceName : [spaceName];

  const client = createClient({
    accessToken: process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN!,
  });

  for (const spaceName of spaceNames) {
    if (!spaceName) continue;

    const spaceNameArr = splitOnFirstOccurrence(spaceName, "_");
    const name = spaceNameArr[0];
    const environment = spaceNameArr.length > 1 ? spaceNameArr[1] : "master";

    // see if it is a valid space, then look for api keys
    // and return this if it is...
    try {
      const space = await client.getSpace(name);
      if (space) {
        const spaceEnvironment = await space.getEnvironment(environment);
        const apiKeys = await space.getApiKeys();
        const previewKeys = await space.getPreviewApiKeys();
        if (spaceEnvironment && apiKeys.total > 0 && previewKeys.total > 0) {
          return {
            spaceId: space.sys.id,
            spaceName: space.name,
            cda: apiKeys.items[0].accessToken,
            cpa: previewKeys.items[0].accessToken,
            environment,
          };
        }
      }
    } catch (error) {
      console.log(
        `getContentfulSpaceName.ts - Error fetching API keys for space: ${name}`,
        spaceNames
      );
    }
  }

  // Otherwise DEFAULT
  const spaceId = process.env[`CONTENTFUL_SPACE_ID`] || "";
  const cda = process.env[`CONTENTFUL_DELIVERY_ACCESS_TOKEN`] || "";
  const cpa = process.env[`CONTENTFUL_PREVIEW_ACCESS_TOKEN`] || "";

  const space = await client.getSpace(spaceId);
  if (!space) {
    console.log(`Could NOT find ${spaceId}`);
    return undefined;
  }

  return {
    spaceId,
    spaceName: space.name,
    cda,
    cpa,
    environment: "master",
  };
}

function splitOnFirstOccurrence(str: string, char: string) {
  const index = str.indexOf(char);
  return index !== -1 ? [str.slice(0, index), str.slice(index + 1)] : [str];
}
