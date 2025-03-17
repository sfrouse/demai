import { createClient } from "contentful-management";

export default async function ensureDemAITokensContentType(
  cmaToken: string,
  spaceId: string,
  environmentId: string
) {
  const client = createClient({ accessToken: cmaToken });

  try {
    const space = await client.getSpace(spaceId);
    const environment = await space.getEnvironment(environmentId);

    const expectedFields = [
      {
        id: "title",
        name: "Title",
        type: "Symbol",
        required: true,
        localized: false,
      },
      {
        id: "source",
        name: "Source",
        type: "Object",
        required: false,
        localized: false,
      },
      {
        id: "json",
        name: "JSON",
        type: "Object",
        required: false,
        localized: false,
      },
      {
        id: "jsonNested",
        name: "JSON Nested",
        type: "Object",
        required: false,
        localized: false,
      },
      {
        id: "css",
        name: "CSS",
        type: "Text",
        required: false,
        localized: false,
      },
      {
        id: "scss",
        name: "SCSS",
        type: "Text",
        required: false,
        localized: false,
      },
      {
        id: "contentfulTokens",
        name: "Contentful Tokens",
        type: "Text",
        required: false,
        localized: false,
      },
    ];

    let contentType;
    try {
      contentType = await environment.getContentType("demai-tokens");
      console.log(`Content type "demai-tokens" already exists.`);

      // Check for missing or incorrect fields
      // const existingFields = contentType.fields.map((field: any) => field.id);
      let needsUpdate = false;

      for (const field of expectedFields) {
        const existingField = contentType.fields.find(
          (f: any) => f.id === field.id
        );
        if (!existingField || existingField.type !== field.type) {
          console.log(`Updating field: ${field.id}`);
          needsUpdate = true;

          if (!existingField) {
            contentType.fields.push(field); // Add missing field
          } else {
            Object.assign(existingField, field); // Update field definition
          }
        }
      }

      if (contentType.displayField !== "title") {
        console.log('Updating displayField to "title".');
        contentType.displayField = "title";
        needsUpdate = true;
      }

      if (needsUpdate) {
        contentType = await contentType.update();
        await contentType.publish();
        console.log(`Content type "demai-tokens" updated and published.`);
      } else {
        console.log(`No updates needed for "demai-tokens".`);
      }
      return;
    } catch (error: any) {
      if (error.name !== "NotFound") {
        throw error;
      }
      console.log(`Content type "demai-tokens" not found, creating...`);
    }

    // Create the content type if it doesn't exist
    const newContentType = await environment.createContentTypeWithId(
      "demai-tokens",
      {
        name: "DemAI Tokens",
        description:
          "Stores design tokens in both JSON and CSS formats for use in the DemAI system.",
        fields: expectedFields,
      }
    );

    newContentType.displayField = "title";
    const updatedContentType = await newContentType.update();
    await updatedContentType.publish();
    console.log(`Content type "demai-tokens" created and published.`);
  } catch (error) {
    console.error("Error ensuring content type:", error);
  }
}
