import { PageAppSDK } from "@contentful/app-sdk";
import { AppInstallationParameters } from "../../../../../../locations/config/ConfigScreen";
import { createClient } from "contentful-management";
import { Entry } from "contentful";

export default async function saveComponent(
  sdk: PageAppSDK,
  comp: Entry | undefined,
  localCDef: string,
  localBindings: string,
  localJavaScript: string
) {
  if (!comp) {
    console.error("no comp to save");
    return;
  }

  const params = sdk.parameters.installation as AppInstallationParameters;
  const client = createClient({
    accessToken: params.cma,
  });
  const space = await client.getSpace(sdk.ids.space);
  const environment = await space.getEnvironment(sdk.ids.environment);
  const entry = await environment.getEntry(comp.sys.id);

  entry.fields.componentDefinition = {
    "en-US": JSON.parse(localCDef),
  };

  entry.fields.javascript = {
    "en-US": localJavaScript,
  };

  entry.fields.bindings = {
    "en-US": JSON.parse(localBindings),
  };

  console.log("entry", entry);

  const updatedEntry = await entry.update();
  await updatedEntry.publish();
}
