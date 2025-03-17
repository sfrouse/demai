import { createClient } from "contentful-management";
import { DEMAI_TOKENS_SINGLETON_ENTRY_ID } from "../DesignSystemMCPClient";
import tokens from "demai-design-system-core/src/tokens/tokens/dmo.tokens.json";
import transformTokens from "demai-design-system-core/src/tokens/scripts/transformTokens";

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

    // Create the singleton entry with a fixed ID with default tokens...
    const tokenCode = await transformTokens(tokens, "dmai", "../");
    let jsonTokens = {};
    try {
      jsonTokens = JSON.parse(
        tokenCode?.find((code: any) => code.name === "json")?.content
      );
    } catch {}

    let jsonNestedTokens = {};
    try {
      jsonNestedTokens = JSON.parse(
        tokenCode?.find((code: any) => code.name === "jsonNested")?.content
      );
    } catch {}

    const entry = await environment.createEntryWithId(
      "demai-tokens",
      DEMAI_TOKENS_SINGLETON_ENTRY_ID,
      {
        fields: {
          title: {
            "en-US": "DemAI Tokens",
          },
          source: {
            "en-US": tokens,
          },
          json: {
            "en-US": jsonTokens,
          },
          jsonNested: {
            "en-US": jsonNestedTokens,
          },
          css: {
            "en-US": tokenCode?.find((code: any) => code.name === "css")
              ?.content,
          },
          scss: {
            "en-US": tokenCode?.find((code: any) => code.name === "scss")
              ?.content,
          },
          contentfulTokens: {
            "en-US": tokenCode?.find((code: any) => code.name === "contentful")
              ?.content,
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
