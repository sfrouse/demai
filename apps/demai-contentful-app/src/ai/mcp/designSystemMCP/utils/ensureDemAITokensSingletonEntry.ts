import { createClient } from "contentful-management";
import { DEMAI_TOKENS_SINGLETON_ENTRY_ID } from "../DesignSystemMCPClient";

export default async function ensureDemAITokensSingletonEntry(
  cmaToken: string,
  spaceId: string,
  environmentId: string
) {
  const client = createClient({ accessToken: cmaToken });

  try {
    const space = await client.getSpace(spaceId);
    const environment = await space.getEnvironment(environmentId);

    // Check if content type exists
    try {
      await environment.getContentType("demai-tokens");
    } catch (error: any) {
      console.error(
        `Content type "demai-tokens" does not exist. Run the content type script first.`
      );
      return;
    }

    // Check if entry with the specific ID exists
    try {
      await environment.getEntry(DEMAI_TOKENS_SINGLETON_ENTRY_ID);
      console.log(
        `Singleton entry "${DEMAI_TOKENS_SINGLETON_ENTRY_ID}" already exists.`
      );
      return;
    } catch (error: any) {
      if (error.name !== "NotFound") {
        throw error;
      }
      console.log(
        `No entry found with ID "${DEMAI_TOKENS_SINGLETON_ENTRY_ID}", creating one...`
      );
    }

    // Create the singleton entry with a fixed ID
    const entry = await environment.createEntryWithId(
      "demai-tokens",
      DEMAI_TOKENS_SINGLETON_ENTRY_ID,
      {
        fields: {
          title: {
            "en-US": "DemAI Tokens", // Title for the entry
          },
          jsonTokens: {
            "en-US": {}, // Default empty object for JSON tokens
          },
          cssTokens: {
            "en-US": "", // Default empty string for CSS tokens
          },
        },
      }
    );

    // Publish the entry
    await entry.publish();
    console.log(
      `Singleton entry "${DEMAI_TOKENS_SINGLETON_ENTRY_ID}" created and published.`
    );
  } catch (error) {
    console.error("Error ensuring singleton entry:", error);
  }
}
