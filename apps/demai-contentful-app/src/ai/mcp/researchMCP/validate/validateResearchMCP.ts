import { createClient } from "contentful-management";
import { IMCPClientValidation } from "../../MCPClient";
import {
  checkContentTypeValid,
  checkSingleton,
} from "../../ContentfulValidations";
import {
  DEMAI_RESEARCH_CTYPE_ID,
  DEMAI_RESEARCH_EXPECTED_FIELDS,
  DEMAI_RESEARCH_SINGLETON_ENTRY_ID,
} from "./ctypes/demaiResearchCType";

export default async function validateResearchMCP(
  cmaToken: string,
  spaceId: string,
  environmentId: string
): Promise<IMCPClientValidation> {
  const client = createClient({ accessToken: cmaToken });
  const space = await client.getSpace(spaceId);
  const environment = await space.getEnvironment(environmentId);

  // MAIN RESEARCH CTYPE
  const researchContentType = await checkContentTypeValid(
    DEMAI_RESEARCH_CTYPE_ID,
    DEMAI_RESEARCH_EXPECTED_FIELDS,
    environment
  );

  // RESEARCH SINGLETON
  const researchSingleton = await checkSingleton(
    DEMAI_RESEARCH_SINGLETON_ENTRY_ID,
    environment
  );

  return {
    valid: researchContentType.valid && researchSingleton,
    details: {
      researchContentType,
      researchSingleton: {
        exists: researchSingleton,
        fieldsValid: true,
        valid: researchSingleton,
      },
    },
  };
}
