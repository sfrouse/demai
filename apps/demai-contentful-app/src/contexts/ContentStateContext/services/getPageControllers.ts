import { ContentfulClientApi } from "contentful";
import { AppError } from "../../ErrorContext/ErrorContext";
import { DEMAI_CONTROLLER_CTYPE_ID } from "../../../ai/mcp/designSystemMCP/validate/ctypes/demaiControllerCType";

export default async function getPageControllers(
    previewClient: ContentfulClientApi<undefined> | undefined,
    addError?: (err: AppError) => void,
) {
    if (!previewClient) return null;
    try {
        const componentEntries = await previewClient.getEntries({
            content_type: DEMAI_CONTROLLER_CTYPE_ID,
        });

        return (componentEntries.items || []).sort((a, b) => {
            return a.sys.id.localeCompare(b.sys.id);
        });
    } catch (error: any) {
        console.error("Error fetching Page Controllers:", error);
        addError &&
            addError({
                service: "Getting Components",
                message: "Error getting components.",
                details: `${error}`,
            });
        return null;
    }
}
