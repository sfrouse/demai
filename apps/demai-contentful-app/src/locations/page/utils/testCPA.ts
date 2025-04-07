import { PageAppSDK } from "@contentful/app-sdk";
import * as contentful from "contentful";

export default async function testCPA(cpa: string, sdk: PageAppSDK) {
  const previewClient = cpa
    ? contentful.createClient({
        space: sdk.ids.space,
        environment: sdk.ids.environment,
        accessToken: cpa,
        host: "preview.contentful.com",
      })
    : undefined;

  try {
    const entries = await previewClient?.getEntries();
    return true;
  } catch {
    return false;
  }
}
