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
  const contentType = await environment.getContentType(params.contentTypeId);

  const finalFields: any = {};
  const isObject = (value: unknown): value is Record<string, unknown> => {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  };

  if (!params.fields) {
    return {
      content: [
        {
          type: "text",
          text: "error: no fields sent...try again.",
        },
      ],
    };
  }

  Object.entries(params.fields).forEach(([key, value]) => {
    const fieldDef = contentType.fields.find((f: any) => f.id === key);
    if (!fieldDef) return; // Skip unknown fields

    let transformedValue = value;

    switch (fieldDef.type) {
      case "Number":
        transformedValue = Number(value);
        break;
      case "Boolean":
        transformedValue = value === "true" || value === true;
        break;
      case "RichText":
        transformedValue = {
          nodeType: "document",
          data: {},
          content: Array.isArray(value) ? value : [],
        };
        break;
      case "Array":
        transformedValue = Array.isArray(value) ? value : [value];
        break;
      case "Link":
        transformedValue = {
          sys: {
            type: "Link",
            linkType: fieldDef.linkType,
            id: value,
          },
        };
        break;
      // Add more types as needed
    }

    finalFields[key] = { "en-US": transformedValue };
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
