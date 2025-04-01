import { createClient, Environment } from "contentful-management";
import { IMCPClientValidation } from "../../MCPClient";
import {
  DEMAI_COMPONENT_CTYPE_ID,
  DEMAI_COMPONENT_EXPECTED_FIELDS,
} from "./ctypes/demaiComponentCType";
import {
  DEMAI_TOKENS_CTYPE_ID,
  DEMAI_TOKENS_EXPECTED_FIELDS,
  DEMAI_TOKENS_SINGLETON_ENTRY_ID,
} from "./ctypes/demaiTokensCType";
import {
  checkContentTypeValid,
  checkSingleton,
} from "../../ContentfulValidations";

export default async function validateDesignSystemMCP(
  cmaToken: string,
  spaceId: string,
  environmentId: string
): Promise<IMCPClientValidation> {
  const client = createClient({ accessToken: cmaToken });
  const space = await client.getSpace(spaceId);
  const environment = await space.getEnvironment(environmentId);

  // COMPONENT
  const componentContentType = await checkContentTypeValid(
    DEMAI_COMPONENT_CTYPE_ID,
    DEMAI_COMPONENT_EXPECTED_FIELDS,
    environment
  );

  // TOKENS
  const tokensContentType = await checkContentTypeValid(
    DEMAI_TOKENS_CTYPE_ID,
    DEMAI_TOKENS_EXPECTED_FIELDS,
    environment
  );

  const tokensSingleton = await checkSingleton(
    DEMAI_TOKENS_SINGLETON_ENTRY_ID,
    environment
  );

  // PAGE

  // WEBSITE ?

  return {
    valid:
      tokensContentType.valid && componentContentType.valid && tokensSingleton,
    details: {
      componentContentType,
      tokensContentType,
      tokensSingleton: {
        exists: tokensSingleton,
        fieldsValid: true,
        valid: tokensSingleton,
      },
    },
  };
}
