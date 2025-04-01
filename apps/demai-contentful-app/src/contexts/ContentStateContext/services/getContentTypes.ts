import { PageAppSDK } from "@contentful/app-sdk";
import { AppInstallationParameters } from "../../../locations/config/ConfigScreen";
import { createClient } from "contentful-management";

export default async function getContentTypes(sdk: PageAppSDK) {
  const params = sdk.parameters.installation as AppInstallationParameters;
  const client = createClient({
    accessToken: params.cma,
  });
  const space = await client.getSpace(sdk.ids.space);
  const environment = await space.getEnvironment(sdk.ids.environment);
  const contentTypes = await environment.getContentTypes();
  return (contentTypes.items || [])
    .filter((item) => !item.sys.id.startsWith("demai-"))
    .sort((a, b) => a.sys.id.localeCompare(b.sys.id));
}
