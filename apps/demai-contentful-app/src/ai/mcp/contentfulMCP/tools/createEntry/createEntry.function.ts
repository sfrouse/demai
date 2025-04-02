import { createClient } from "contentful-management";

export default async function createEntryFunction(
  cmaToken: string,
  spaceId: string,
  environmentId: string,
  params: { contentTypeId: string; fields: { [key: string]: any } }
) {
  const client = createClient({ accessToken: cmaToken });
  const space = await client.getSpace(spaceId);
  const environment = await space.getEnvironment(environmentId);

  const finalFields: any = {};
  const isObject = (value: unknown): value is Record<string, unknown> => {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  };
  Object.entries(params.fields).map(([key, value]) => {
    finalFields[key] = isObject(value) ? value : { ["en-US"]: value };
  });

  const entry = await environment.createEntry(params.contentTypeId, {
    fields: finalFields,
  });

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(entry, null, 2),
      },
    ],
  };
}
