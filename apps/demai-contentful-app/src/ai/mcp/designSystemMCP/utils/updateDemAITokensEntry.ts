import { createClient } from "contentful-management";

type DemAITokensUpdateData = {
  title?: string;
  jsonTokens?: Record<string, any>;
  cssTokens?: string;
  scssTokens?: string;
  contentfulTokens?: string;
};

export async function updateDemAITokensEntry(
  cmaToken: string,
  spaceId: string,
  environmentId: string,
  entryId: string,
  updatedData: DemAITokensUpdateData
) {
  const client = createClient({ accessToken: cmaToken });

  try {
    const space = await client.getSpace(spaceId);
    const environment = await space.getEnvironment(environmentId);

    // Fetch the singleton entry
    const entry = await environment.getEntry(entryId);

    let needsUpdate = false;

    // Update fields if provided
    for (const key of Object.keys(
      updatedData
    ) as (keyof DemAITokensUpdateData)[]) {
      if (updatedData[key] !== undefined) {
        if (!entry.fields[key]) {
          entry.fields[key] = {};
        }
        entry.fields[key]["en-US"] = updatedData[key];
        needsUpdate = true;
      }
    }

    if (!needsUpdate) {
      console.log(`No updates needed for entry "${entryId}".`);
      return;
    }

    // Update & publish the entry
    const updatedEntry = await entry.update();
    await updatedEntry.publish();

    console.log(`Entry "${entryId}" updated and published successfully.`);
  } catch (error) {
    console.error("Error updating entry:", error);
  }
}
