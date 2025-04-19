import createCMAEnvironment from "../../AIStateContext/utils/createCMAEnvironment";
import { AppError } from "../../ErrorContext/ErrorContext";

export async function getAssetsByTag(
    cmaToken: string,
    spaceId: string,
    environmentId: string,
    tagId: string,
    addError: (err: AppError) => void,
) {
    try {
        const env = await createCMAEnvironment(
            cmaToken,
            spaceId,
            environmentId,
        );

        const assets = await env.getAssets({
            "metadata.tags.sys.id[in]": tagId,
            limit: 1000, // optional: adjust as needed
        });

        return assets.items;
    } catch (error: any) {
        addError &&
            addError({
                service: "Getting Assets",
                message: "Error fetching DemAI Assets",
                details: `${error}`,
            });
        return null;
    }
}
