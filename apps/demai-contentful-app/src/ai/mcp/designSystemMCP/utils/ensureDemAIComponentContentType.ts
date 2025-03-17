import { createClient } from "contentful-management";

export default async function ensureDemAIComponentsContentType(
  cmaToken: string,
  spaceId: string,
  environmentId: string
) {
  const client = createClient({ accessToken: cmaToken });

  try {
    const space = await client.getSpace(spaceId);
    const environment = await space.getEnvironment(environmentId);

    // Check if content type exists
    let contentType;
    try {
      contentType = await environment.getContentType("demai-component");
      console.log(`Content type "demai-component" already exists.`);
      return;
    } catch (error: any) {
      if (error.name !== "NotFound") {
        throw error;
      }
      console.log(`Content type "demai-component" not found, creating...`);
    }

    // Define content type fields
    const newContentType = await environment.createContentTypeWithId(
      "demai-component",
      {
        name: "DemAI Component",
        description:
          "Stores component information (Definition and Web Component) for use in the DemAI system.",
        fields: [
          {
            id: "title",
            name: "Title",
            type: "Symbol",
            localized: false,
            required: true,
          },
          {
            id: "componentDefinition",
            name: "Definition",
            type: "Object",
            localized: false,
            required: true,
          },
          {
            id: "javascript",
            name: "Javascript",
            type: "Text",
            localized: false,
            required: true,
          },
        ],
      }
    );

    // Publish the content type
    newContentType.displayField = "title";
    const updatedContentType = await newContentType.update();
    await updatedContentType.publish();
    console.log(`Content type "demai-component" created and published.`);
  } catch (error) {
    console.error("Error ensuring content type:", error);
  }
}
