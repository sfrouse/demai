import { createClient, Environment } from "contentful-management";
import {
  DEMAI_TOKENS_EXPECTED_FIELDS,
  DEMAI_TOKENS_CTYPE_ID,
  DEMAI_TOKENS_DISPLAY_FIELD,
} from "./ctypes/demaiTokensCType";
import {
  DEMAI_COMPONENT_CTYPE_ID,
  DEMAI_COMPONENT_DISPLAY_FIELD,
  DEMAI_COMPONENT_EXPECTED_FIELDS,
} from "./ctypes/demaiComponentCType";
import ensureDemAITokensSingletonEntry from "../functions/utils/demaiTokensSingleton/ensureDemAITokensSingletonEntry";
import { updateContenType } from "../../ContentfulValidations";
import {
  DEMAI_CONTROLLER_CTYPE_ID,
  DEMAI_CONTROLLER_DISPLAY_FIELD,
  DEMAI_CONTROLLER_EXPECTED_FIELDS,
} from "./ctypes/demaiControllerCType";
import {
  DEMAI_BINDING_CTYPE_ID,
  DEMAI_BINDING_DISPLAY_FIELD,
  DEMAI_BINDING_EXPECTED_FIELDS,
} from "./ctypes/demaiBindingsCType";
import installWebComponent from "./webComponents/installWebComponent";
import demaiButton from "./webComponents/components/demai-button";

export default async function updateDesignSystemMCP(
  cmaToken: string,
  spaceId: string,
  environmentId: string
) {
  const client = createClient({ accessToken: cmaToken });
  const space = await client.getSpace(spaceId);
  const environment = await space.getEnvironment(environmentId);

  const errors: string[] = [];

  await updateContenType(
    DEMAI_TOKENS_CTYPE_ID,
    DEMAI_TOKENS_EXPECTED_FIELDS,
    DEMAI_TOKENS_DISPLAY_FIELD,
    environment,
    errors
  );

  await updateContenType(
    DEMAI_COMPONENT_CTYPE_ID,
    DEMAI_COMPONENT_EXPECTED_FIELDS,
    DEMAI_COMPONENT_DISPLAY_FIELD,
    environment,
    errors
  );

  // BEFORE CONTROLLER
  await updateContenType(
    DEMAI_BINDING_CTYPE_ID,
    DEMAI_BINDING_EXPECTED_FIELDS,
    DEMAI_BINDING_DISPLAY_FIELD,
    environment,
    errors
  );

  await updateContenType(
    DEMAI_CONTROLLER_CTYPE_ID,
    DEMAI_CONTROLLER_EXPECTED_FIELDS,
    DEMAI_CONTROLLER_DISPLAY_FIELD,
    environment,
    errors
  );

  await ensureDemAITokensSingletonEntry(
    cmaToken,
    spaceId,
    environmentId,
    errors
  );

  // More components to come...
  await installWebComponent(cmaToken, spaceId, environmentId, demaiButton);

  return errors;
}
