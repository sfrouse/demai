import { createClient } from "contentful-management";
import webComponentManifest from "./webComponentManifest";

export default async function validateWebComponents(
  cmaToken: string,
  spaceId: string,
  environmentId: string
) {
  const client = createClient({ accessToken: cmaToken });
  const space = await client.getSpace(spaceId);
  const environment = await space.getEnvironment(environmentId);
  const manifest = webComponentManifest;

  const promiseArr = [];
  const missingComps: string[] = [];
  let valid = true;
  for (const compInfo of manifest) {
    promiseArr.push(
      (async () => {
        try {
          const ctype = await environment.getContentType(compInfo.id);
          console.log("ctype", ctype);
          return ctype ? true : false;
        } catch {
          valid = false;
          missingComps.push(compInfo.id);
          return false;
        }
      })()
    );
  }

  await Promise.all(promiseArr);

  return {
    exists: valid,
    valid,
    missingComps,
  };
}
