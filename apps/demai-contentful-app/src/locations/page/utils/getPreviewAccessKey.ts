import { createClient, PreviewApiKey, Space } from "contentful-management";
import { DEMAI_SYSTEM_PROPERTY_IDENTIFIER } from "../../../constants";

function getKeyIdentifier(environmentId: string) {
  return `${DEMAI_SYSTEM_PROPERTY_IDENTIFIER}-${environmentId}`;
}

export default async function getPreviewAccessKey(
  cma: string,
  spaceId: string,
  environmentId: string
) {
  const keyIdentifier = getKeyIdentifier(environmentId);
  const client = createClient({
    accessToken: cma,
  });
  const space: Space = await client.getSpace(spaceId);

  let previewAccessToken: string | undefined = await loadPreviewAccessKey(
    space,
    keyIdentifier
  );

  if (!previewAccessToken) {
    console.log("Creating access token", keyIdentifier);
    await space.createApiKeyWithId(keyIdentifier, {
      name: keyIdentifier,
      description: keyIdentifier,
      environments: [
        {
          sys: {
            type: "Link",
            linkType: "Environment",
            id: environmentId,
          },
        },
      ],
    });
    // try again...
    previewAccessToken = await loadPreviewAccessKey(space, keyIdentifier);
  }
  return previewAccessToken;
}

async function loadPreviewAccessKey(space: Space, fullKeyName: string) {
  const previewKeys = await space.getPreviewApiKeys();
  const previewKey: PreviewApiKey | undefined = previewKeys?.items?.find(
    (key) => {
      return key.name === fullKeyName;
    }
  );
  return previewKey?.accessToken;
}

export async function deleteAllPreviewAccessKey(
  cma: string,
  spaceId: string,
  environmentId: string
) {
  const keyIdentifier = getKeyIdentifier(environmentId);
  const client = createClient({
    accessToken: cma,
  });
  const space: Space = await client.getSpace(spaceId);
  let keys = await space.getApiKeys();
  for (const key of keys.items) {
    if (key.sys.id === keyIdentifier) {
      console.log("Deleting preview key:", key.sys.id);
      const apiKey = await space.getApiKey(key.sys.id);
      await apiKey.delete();
    }
  }
}
