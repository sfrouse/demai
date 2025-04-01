import { createClient } from "contentful-management";
import ensureDemAITokensSingletonEntry from "./ensureDemAITokensSingletonEntry";
import {
  DEMAI_TOKENS_CTYPE_ID,
  DEMAI_TOKENS_SINGLETON_ENTRY_ID,
} from "../../../validate/ctypes/demaiTokensCType";

export default async function revertDemAITokensSingletonEntry(
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
    let tokensEntry;
    try {
      tokensEntry = await environment.getEntry(DEMAI_TOKENS_SINGLETON_ENTRY_ID);
      await tokensEntry.unpublish();
      await tokensEntry.delete();
    } catch (error: any) {
      console.log(
        `No entry found with ID "${DEMAI_TOKENS_SINGLETON_ENTRY_ID}", creating one...`
      );
    }

    return ensureDemAITokensSingletonEntry(cmaToken, spaceId, environmentId);
  } catch (error) {
    console.error("Error ensuring singleton entry:", error);
    errors.push("Error ensuring singleton entry:");
  }
}
