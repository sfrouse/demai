import { createClient } from "contentful-management";
import tokens from "demai-design-system-core/src/tokens/tokens/dmo.tokens.json";
import transformTokens from "demai-design-system-core/src/tokens/scripts/transformTokens";
import {
  DEMAI_RESEARCH_CTYPE_ID,
  DEMAI_RESEARCH_SINGLETON_ENTRY_ID,
} from "../ctypes/demaiResearchCType";

export default async function ensureResearchSingletonEntry(
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
      await environment.getContentType(DEMAI_RESEARCH_CTYPE_ID);
    } catch (error: any) {
      console.error(
        `Content type ${DEMAI_RESEARCH_CTYPE_ID} does not exist. Run the content type script first.`
      );
      errors.push(
        `Content type ${DEMAI_RESEARCH_CTYPE_ID} does not exist. Run the content type script first.`
      );
      return;
    }

    // Check if entry with the specific ID exists
    try {
      await environment.getEntry(DEMAI_RESEARCH_SINGLETON_ENTRY_ID);
      return;
    } catch {
      console.log(
        `No entry found with ID "${DEMAI_RESEARCH_SINGLETON_ENTRY_ID}", creating one...`
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
      DEMAI_RESEARCH_CTYPE_ID,
      DEMAI_RESEARCH_SINGLETON_ENTRY_ID,
      {
        fields: {
          title: {
            "en-US": "DemAI Research",
          },
        },
      }
    );

    // Publish the entry
    await entry.publish();
  } catch (error) {
    console.error("Error ensuring singleton entry:", error);
    errors.push("Error ensuring singleton entry");
  }
}
