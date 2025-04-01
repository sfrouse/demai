import { Environment } from "contentful-management";

export async function checkSingleton(
  singletonId: string,
  environment: Environment
) {
  try {
    await environment.getEntry(singletonId);
    return true;
  } catch (error: any) {
    return false;
  }
}

export async function checkContentTypeValid(
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

export async function updateContenType(
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

export async function createContentType(
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
        // description:
        //   "Stores component information (Definition and Web Component) for use in the DemAI system.",
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
