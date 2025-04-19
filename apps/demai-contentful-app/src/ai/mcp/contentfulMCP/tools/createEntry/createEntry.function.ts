import { createClient } from "contentful-management";
import addDemaiTag from "../../../../AIAction/actions/contentful/utils/addDemaiTag";

export default async function createEntryFunction(
    cmaToken: string,
    spaceId: string,
    environmentId: string,
    params: { contentTypeId: string; fields: { [key: string]: any } },
) {
    const client = createClient({ accessToken: cmaToken });
    const space = await client.getSpace(spaceId);
    const environment = await space.getEnvironment(environmentId);
    const contentType = await environment.getContentType(params.contentTypeId);

    const finalFields: any = {};

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

        switch (fieldDef.type) {
            case "Number":
                finalFields[key] = { "en-US": Number(value) };
                break;
            case "Boolean":
                finalFields[key] = {
                    "en-US": value === "true" || value === true,
                };
                break;
            case "RichText":
                finalFields[key] = {
                    "en-US": {
                        nodeType: "document",
                        data: {},
                        content: Array.isArray(value) ? value : [],
                    },
                };
                break;
            case "Array":
                // if (fieldDef.items?.linkType === "Asset") {
                if (fieldDef.items?.type === "Link") {
                    // nada
                } else {
                    // assuming they are strings
                    finalFields[key] = {
                        "en-US": Array.isArray(value) ? value : [value],
                    };
                }
                break;
            case "Link":
                if (fieldDef.linkType !== "Asset") {
                    finalFields[key] = {
                        "en-US": {
                            sys: {
                                type: "Link",
                                linkType: fieldDef.linkType,
                                id: value,
                            },
                        },
                    };
                }
                break;

            case "Text":
            case "Symbol": {
                finalFields[key] = {
                    "en-US": value,
                };
            }
            // Add more types as needed
        }
    });

    const entry = await environment.createEntry(params.contentTypeId, {
        fields: finalFields,
    });

    await addDemaiTag(environment, entry);
    const updatedEntry = await entry.update();
    await updatedEntry.publish();

    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(entry, null, 2),
            },
        ],
    };
}
