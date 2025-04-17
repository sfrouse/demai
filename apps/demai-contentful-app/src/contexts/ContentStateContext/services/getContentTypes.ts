import { createClient } from "contentful-management";
import { AIActionConfig } from "../../../ai/AIAction/AIActionTypes";

export default async function getContentTypes(
    config: AIActionConfig,
    systemCTypes: boolean = false,
) {
    const client = createClient({
        accessToken: config.cma,
    });
    const space = await client.getSpace(config.spaceId);
    const environment = await space.getEnvironment(config.environmentId);
    const contentTypes = await environment.getContentTypes();
    if (systemCTypes) {
        return (contentTypes.items || [])
            .filter((item) => item.sys.id.startsWith("demai-"))
            .sort((a, b) => a.sys.id.localeCompare(b.sys.id));
    } else {
        return (contentTypes.items || [])
            .filter((item) => !item.sys.id.startsWith("demai-"))
            .sort((a, b) => a.sys.id.localeCompare(b.sys.id));
    }
}
