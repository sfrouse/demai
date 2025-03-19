import { createClient, Environment } from "contentful-management";
import {
  DEMAI_TOKENS_EXPECTED_FIELDS,
  DEMAI_TOKENS_CTYPE_ID,
  DEMAI_TOKENS_SINGLETON_ENTRY_ID,
} from "./demaiTokensCType";
import {
  DEMAI_COMPONENT_CTYPE_ID,
  DEMAI_COMPONENT_EXPECTED_FIELDS,
} from "../components/demaiComponentCType";

export type DEMAI_VALID_ENTRY = {
  exists: boolean;
  fieldsValid: boolean;
  valid: boolean;
};

export type DEMAI_VALID = {
  valid: boolean;
  componentContentType: DEMAI_VALID_ENTRY;
  tokensContentType: DEMAI_VALID_ENTRY;
  tokensSingleton: DEMAI_VALID_ENTRY;
};

export default async function validateDemAIContentModel(
  cmaToken: string,
  spaceId: string,
  environmentId: string
): Promise<DEMAI_VALID> {
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
    componentContentType,
    tokensContentType,
    tokensSingleton: {
      exists: tokensSingleton,
      fieldsValid: true,
      valid: tokensSingleton,
    },
    valid:
      tokensContentType.valid && componentContentType.valid && tokensSingleton,
  };
}

async function checkSingleton(singletonId: string, environment: Environment) {
  try {
    await environment.getEntry(singletonId);
    return true;
  } catch (error: any) {
    return false;
  }
}

async function checkContentTypeValid(
  contentTypeId: string,
  expectedFields: any,
  environment: Environment
) {
  const exists = await checkContentType(contentTypeId, environment);
  const fieldsValid = await checkExpectedFields(
    contentTypeId,
    expectedFields,
    environment
  );

  return {
    exists,
    fieldsValid,
    valid: exists && fieldsValid,
  };
}

export async function checkContentType(
  contentTypeId: string,
  environment: Environment
) {
  let contentType;
  try {
    contentType = await environment.getContentType(contentTypeId);
    return true;
  } catch (error: any) {
    return false;
  }
}

export async function checkExpectedFields(
  contentTypeId: string,
  expectedFields: any,
  environment: Environment
) {
  try {
    const contentType = await environment.getContentType(contentTypeId);
    let isValid = true;
    for (const field of expectedFields) {
      const existingField = contentType.fields.find(
        (f: any) => f.id === field.id
      );
      if (!existingField || existingField.type !== field.type) {
        isValid = false;
      }
    }
    return isValid;
  } catch (error: any) {
    return false;
  }
}
