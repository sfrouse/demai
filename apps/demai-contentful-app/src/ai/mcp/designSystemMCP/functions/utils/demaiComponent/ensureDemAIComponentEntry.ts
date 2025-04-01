import { createClient, Entry } from "contentful-management";
import { DEMAI_COMPONENT_CTYPE_ID } from "../../../validate/ctypes/demaiComponentCType";

export default async function ensureDemAIComponentEntry(
  cmaToken: string,
  spaceId: string,
  environmentId: string,
  entryId: string,
  entryFields: Record<string, any>
) {
  const client = createClient({ accessToken: cmaToken });

  try {
    const space = await client.getSpace(spaceId);
    const environment = await space.getEnvironment(environmentId);

    // Check if entry exists
    let entry: Entry;
    try {
      entry = await environment.getEntry(entryId);
      console.log(`Entry "${entryId}" found, updating...`);

      // Update entry fields
      Object.keys(entryFields).forEach((field) => {
        entry.fields[field] = { "en-US": entryFields[field] };
      });

      entry = await entry.update();
      await entry.publish();
      console.log(`Entry "${entryId}" updated successfully.`);
    } catch (error: any) {
      if (error.name === "NotFound") {
        console.log(`Entry "${entryId}" not found, creating new entry...`);

        entry = await environment.createEntryWithId(
          DEMAI_COMPONENT_CTYPE_ID,
          entryId,
          {
            fields: Object.fromEntries(
              Object.entries(entryFields).map(([key, value]) => [
                key,
                { "en-US": value },
              ])
            ),
          }
        );

        await entry.publish();
        console.log(`Entry "${entryId}" created and published.`);
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error("Error ensuring DemAI component entry:", error);
  }
}
