import { createClient, PreviewApiKey, Space } from "contentful-management";
import { DEMAI_PREVIEW_ACCESS_KEY_NAME } from "../../../constants";

export default async function getPreviewAccessKey(
  cma: string,
  spaceId: string,
  environmentId: string
) {
  const fullKeyName = `${DEMAI_PREVIEW_ACCESS_KEY_NAME} (${environmentId})`;
  const client = createClient({
    accessToken: cma,
  });
  const space: Space = await client.getSpace(spaceId);

  let previewAccessToken: string | undefined = await loadPreviewAccessKey(
    space,
    fullKeyName
  );

  if (!previewAccessToken) {
    await space.createApiKey({
      name: fullKeyName,
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
    previewAccessToken = await loadPreviewAccessKey(space, fullKeyName);
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
