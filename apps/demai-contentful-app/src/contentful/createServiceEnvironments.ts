import { PageAppSDK } from "@contentful/app-sdk";
import { createClient } from "contentful-management";
import { AppInstallationParameters } from "../locations/ConfigScreen";

const DEMAI_SANDBOX_ENV_ID = "donottouch-demai-sandbox";

export default async function createServiceEnvironments(sdk: PageAppSDK) {
  const params = sdk.parameters.installation as AppInstallationParameters;
  const client = createClient({ accessToken: params.cma });

  try {
    const space = await client.getSpace(sdk.ids.space);
    const environments = await space.getEnvironments();

    // Check if environment already exists
    const existingEnv = environments.items.find(
      (env) => env.name === DEMAI_SANDBOX_ENV_ID
    );

    if (existingEnv) {
      console.log(`Environment "${DEMAI_SANDBOX_ENV_ID}" already exists.`);
      return;
    }

    // Create new environment
    const newEnv = await space.createEnvironmentWithId(DEMAI_SANDBOX_ENV_ID, {
      name: DEMAI_SANDBOX_ENV_ID,
    });

    console.log(`Environment "${DEMAI_SANDBOX_ENV_ID}" created successfully.`);
    return newEnv;
  } catch (error) {
    console.error("Error creating environment:", error);
  }
}
