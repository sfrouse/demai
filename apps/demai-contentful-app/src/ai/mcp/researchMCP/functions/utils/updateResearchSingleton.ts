import { createClient } from "contentful-management";

type ResearchUpdateData = {
  title?: string;
  prospect?: string;
  primaryColor?: string;
  secondaryColor?: string;
  tertiaryColor?: string;
};

export async function updateResearchSingleton(
  cmaToken: string,
  spaceId: string,
  environmentId: string,
  entryId: string,
  updatedData: ResearchUpdateData
) {
  const client = createClient({ accessToken: cmaToken });

  try {
    const space = await client.getSpace(spaceId);
    const environment = await space.getEnvironment(environmentId);
    const entry = await environment.getEntry(entryId);

    let needsUpdate = false;

    for (const key of Object.keys(
      updatedData
    ) as (keyof ResearchUpdateData)[]) {
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
    return updatedEntry;
  } catch (error) {
    console.error("Error updating entry:", error);
  }
}
