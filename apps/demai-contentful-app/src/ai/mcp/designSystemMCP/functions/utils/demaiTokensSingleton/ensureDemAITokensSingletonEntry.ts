import { createClient } from "contentful-management";
import tokens from "demai-design-system-core/src/tokens/tokens/dmo.tokens.json";
import transformTokens from "demai-design-system-core/src/tokens/scripts/transformTokens";
import {
  DEMAI_TOKENS_CTYPE_ID,
  DEMAI_TOKENS_SINGLETON_ENTRY_ID,
} from "../../../validate/ctypes/demaiTokensCType";
import { DESIGN_SYSTEM_PREFIX } from "../../../../../../constants";

export default async function ensureDemAITokensSingletonEntry(
  cmaToken: string,
  spaceId: string,
  environmentId: string,
  errors: string[] = []
) {
  const client = createClient({ accessToken: cmaToken });

  try {
    const space = await client.getSpace(spaceId);
    const environment = await space.getEnvironment(environmentId);

    // Check if content type exists
    try {
      await environment.getContentType(DEMAI_TOKENS_CTYPE_ID);
    } catch (error: any) {
      console.error(
        `Content type ${DEMAI_TOKENS_CTYPE_ID} does not exist. Run the content type script first.`
      );
      errors.push(
        `Content type ${DEMAI_TOKENS_CTYPE_ID} does not exist. Run the content type script first.`
      );
      return;
    }

    // Check if entry with the specific ID exists
    try {
      await environment.getEntry(DEMAI_TOKENS_SINGLETON_ENTRY_ID);
      return;
    } catch {
      console.log(
        `No entry found with ID "${DEMAI_TOKENS_SINGLETON_ENTRY_ID}", creating one...`
      );
    }

    // Create the singleton entry with a fixed ID with default tokens...
    const tokenCode = await transformTokens(
      tokens,
      DESIGN_SYSTEM_PREFIX,
      "../"
    );
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
      DEMAI_TOKENS_CTYPE_ID,
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
          ai: {
            "en-US": tokenCode?.find((code: any) => code.name === "ai")
              ?.content,
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
  } catch (error) {
    console.error("Error ensuring token singleton entry:", error);
    errors.push("Error ensuring token singleton entry");
  }
}
