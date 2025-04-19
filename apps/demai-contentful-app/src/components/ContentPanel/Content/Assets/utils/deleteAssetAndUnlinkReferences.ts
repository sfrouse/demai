import createCMAEnvironment from "../../../../../contexts/AIStateContext/utils/createCMAEnvironment";
import { AIActionConfig } from "../../../../../ai/AIAction/AIActionTypes";
import { Entry } from "contentful-management";

export default async function deleteAssetAndUnlinkReferences(
    assetId: string,
    config: AIActionConfig,
) {
    try {
        // 1. Get the asset
        const environment = await createCMAEnvironment(
            config.cma,
            config.spaceId,
            config.environmentId,
        );
        const asset = await environment.getAsset(assetId);

        // 2. Unpublish if published
        if (asset.sys.publishedVersion) {
            await asset.unpublish();
        }

        // 3. Find all entries linking to the asset
        const entries = await environment.getEntries({
            links_to_asset: assetId,
            limit: 1000,
        });

        // 4. Remove references in entries
        for (const entry of entries.items) {
            let modified = false;

            for (const [fieldId, fieldValue] of Object.entries(entry.fields)) {
                const value = (fieldValue as any)["en-US"];
                if (
                    value?.sys?.type === "Link" &&
                    value.sys.linkType === "Asset" &&
                    value.sys.id === assetId
                ) {
                    delete entry.fields[fieldId];
                    modified = true;
                }
            }

            if (modified) {
                const updated = await entry.update();
                if (entry.sys.publishedVersion) {
                    await updated.publish();
                }
            }
        }

        // 5. Delete the asset
        await asset.delete();

        return {
            success: true,
            deleted: assetId,
            unlinkedFrom: entries.items.map((e: Entry) => e.sys.id),
        };
    } catch (err) {
        console.error(`Failed to delete asset or unlink references: ${err}`);
        return { success: false, error: err };
    }
}
