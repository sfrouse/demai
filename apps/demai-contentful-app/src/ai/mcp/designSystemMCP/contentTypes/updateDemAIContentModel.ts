import { createClient, Environment } from "contentful-management";
import {
  DEMAI_TOKENS_EXPECTED_FIELDS,
  DEMAI_TOKENS_CTYPE_ID,
  DEMAI_TOKENS_DISPLAY_FIELD,
} from "./demaiTokensCType";
import {
  checkContentType,
  checkExpectedFields,
} from "./validateDemAIContentModel";
import {
  DEMAI_COMPONENT_CTYPE_ID,
  DEMAI_COMPONENT_DISPLAY_FIELD,
  DEMAI_COMPONENT_EXPECTED_FIELDS,
} from "./demaiComponentCType";
import ensureDemAITokensSingletonEntry from "./tokenSingleton/ensureDemAITokensSingletonEntry";

export default async function updateDemAIContentModel(
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

  await ensureDemAITokensSingletonEntry(
    cmaToken,
    spaceId,
    environmentId,
    errors
  );

  return errors;
}

async function updateContenType(
  contentTypeId: string,
  fields: any,
  displayField: string,
  environment: Environment,
  errors: string[]
) {
  const compsExists = await checkContentType(contentTypeId, environment);
  if (!compsExists) {
    await createContentType(
      contentTypeId,
      fields,
      displayField,
      environment,
      errors
    );
  } else {
    const compsFieldsValid = await checkExpectedFields(
      contentTypeId,
      fields,
      environment
    );
    if (!compsFieldsValid) {
      await updateExpectedFields(
        contentTypeId,
        fields,
        displayField,
        environment,
        errors
      );
    }
  }
}

async function createContentType(
  contentTypeId: string,
  fields: any,
  displayField: string,
  environment: Environment,
  errors: string[]
) {
  try {
    const newContentType = await environment.createContentTypeWithId(
      contentTypeId,
      {
        name: contentTypeId,
        description:
          "Stores component information (Definition and Web Component) for use in the DemAI system.",
        fields,
      }
    );

    // Publish the content type
    newContentType.displayField = displayField;
    const updatedContentType = await newContentType.update();
    await updatedContentType.publish();
    console.log(`Content type ${contentTypeId} created and published.`);
  } catch {
    console.log(`Error creating ${contentTypeId}.`);
    errors.push(`Error creating ${contentTypeId}.`);
  }
}

export async function updateExpectedFields(
  contentTypeId: string,
  expectedFields: any,
  displayField: string,
  environment: Environment,
  errors: string[]
) {
  try {
    let contentType = await environment.getContentType(contentTypeId);
    let needsUpdate = false;

    for (const field of expectedFields) {
      const existingField = contentType.fields.find(
        (f: any) => f.id === field.id
      );
      if (!existingField || existingField.type !== field.type) {
        console.log(`Updating field: ${field.id}`);
        needsUpdate = true;

        if (!existingField) {
          contentType.fields.push(field); // Add missing field
        } else {
          Object.assign(existingField, field); // Update field definition
        }
      }
    }

    if (contentType.displayField !== displayField) {
      contentType.displayField = "title";
      needsUpdate = true;
    }

    if (needsUpdate) {
      contentType = await contentType.update();
      await contentType.publish();
      console.log(`Content type ${contentTypeId} updated and published.`);
    } else {
      console.log(`No updates needed for ${contentTypeId}.`);
    }
  } catch (error: any) {
    console.log(`Error updating ${contentTypeId}.`);
    errors.push(`Error updating ${contentTypeId}.`);
  }
}
