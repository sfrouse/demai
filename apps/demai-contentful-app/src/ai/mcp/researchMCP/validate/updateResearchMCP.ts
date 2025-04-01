import { createClient, Environment } from "contentful-management";
import {
  DEMAI_RESEARCH_CTYPE_ID,
  DEMAI_RESEARCH_DISPLAY_FIELD,
  DEMAI_RESEARCH_EXPECTED_FIELDS,
} from "./ctypes/demaiResearchCType";
import { updateContenType } from "../../ContentfulValidations";
import ensureResearchSingletonEntry from "./entries/ensureResearchSingletonEntry";

export default async function updateResearchMCP(
  cmaToken: string,
  spaceId: string,
  environmentId: string
) {
  const client = createClient({ accessToken: cmaToken });
  const space = await client.getSpace(spaceId);
  const environment = await space.getEnvironment(environmentId);

  const errors: string[] = [];

  await updateContenType(
    DEMAI_RESEARCH_CTYPE_ID,
    DEMAI_RESEARCH_EXPECTED_FIELDS,
    DEMAI_RESEARCH_DISPLAY_FIELD,
    environment,
    errors
  );

  await ensureResearchSingletonEntry(cmaToken, spaceId, environmentId, errors);

  return errors;
}
