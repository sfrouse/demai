import { createClient } from "contentful-management";

export default async function publishContentTypeFunction(
  cmaToken: string,
  spaceId: string,
  environmentId: string,
  params: { contentTypeId: string }
) {
  const client = createClient({ accessToken: cmaToken });
  const space = await client.getSpace(spaceId);
  const environment = await space.getEnvironment(environmentId);
  const contentType = await environment.getContentType(params.contentTypeId);
  await contentType.publish();

  return {
    content: [
      {
        type: "text",
        text: `Content type ${params.contentTypeId} published successfully`,
      },
    ],
  };
}
