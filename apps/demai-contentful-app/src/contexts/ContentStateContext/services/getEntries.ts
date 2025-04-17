import { ContentfulClientApi } from "contentful";
import { AppError } from "../../ErrorContext/ErrorContext";
import { DEMAI_CONTROLLER_CTYPE_ID } from "../../../ai/mcp/designSystemMCP/validate/ctypes/demaiControllerCType";

export default async function getEntries(
    previewClient: ContentfulClientApi<undefined> | undefined,
    addError: (err: AppError) => void,
) {
    if (!previewClient) return null;
    try {
        const componentEntries = await previewClient.getEntries({ limit: 100 });
        return (componentEntries.items || [])
            .filter((item) => {
                return (
                    !item.sys.id.startsWith("demai-") &&
                    !item.sys.id.startsWith("dmai-") &&
                    item.sys.contentType.sys.id !== DEMAI_CONTROLLER_CTYPE_ID
                );
            })
            .sort((a, b) => {
                return a.sys.id.localeCompare(b.sys.id);
            });
    } catch (error: any) {
        addError &&
            addError({
                service: "Getting Entries",
                message: "Error fetching DemAI Tokens",
                details: `${error}`,
            });
        return null;
    }
}
