import { PageAppSDK } from "@contentful/app-sdk";
import { ContentState } from "../../../../contexts/ContentStateContext/ContentStateContext";
import { Entry } from "contentful";

export default async function publishPageControllers(
    entry: Entry,
    sdk: PageAppSDK,
    setLocalLoading: (val: boolean) => void,
    loadProperty: (
        key: keyof ContentState,
        forceRefresh?: boolean | undefined,
    ) => void,
) {
    const publishEntryRecursive = async (entry: Entry) => {
        // publish view first if it exists
        if (entry.fields.view) {
            const latestViewEntry = await sdk.cma.entry.get({
                entryId: (entry.fields.view as any).sys.id,
            });
            await sdk.cma.entry.publish(
                { entryId: latestViewEntry.sys.id },
                latestViewEntry,
            );
        }

        // recursively publish children if present
        const children = Array.isArray(entry.fields.children)
            ? entry.fields.children
            : [];
        for (const child of children) {
            if (typeof child === "object" && child !== null && "sys" in child) {
                await publishEntryRecursive(child as Entry);
            }
        }

        const latestEntry = await sdk.cma.entry.get({
            entryId: entry.sys.id,
        });
        await sdk.cma.entry.publish(
            { entryId: latestEntry.sys.id },
            latestEntry,
        );
    };

    try {
        setLocalLoading(true);
        await publishEntryRecursive(entry);
        sdk.notifier.success(`published entry with id: ${entry.sys.id}`);
    } catch (err: any) {
        sdk.notifier.error(`error: ${err.message}`);
    } finally {
        await loadProperty("pageControllers", true);
        setLocalLoading(false);
    }
}
