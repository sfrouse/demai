import { createClient, CreateContentTypeProps } from "contentful-management";

export default async function createContentTypeFunction(
  cmaToken: string,
  spaceId: string,
  environmentId: string,
  params: {
    name: string;
    description: string;
    displayField: string;
    fields: Array<{
      id: string;
      name: string;
      type: string;
      required?: boolean;
      localized?: boolean;
      validations?: any[];
      disabled?: boolean;
      omitted?: boolean;
    }>;
  }
) {
  const client = createClient({ accessToken: cmaToken });
  const space = await client.getSpace(spaceId);
  const environment = await space.getEnvironment(environmentId);

  const toCamelCase = (str: string): string =>
    str
      .split(/\s+/)
      .map((word: string, index: number) =>
        index === 0
          ? word.toLowerCase()
          : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join("");

  const contentTypeProps: CreateContentTypeProps = {
    name: params.name,
    fields: params.fields.map((field) => ({
      ...field,
      required: field.id === params.displayField ? true : false, // Too brittle for AI latter on // field.required ?? false,
      localized: field.localized ?? false,
    })),
    description: params.description || "",
    displayField: params.displayField || params.fields[0]?.id || "",
  };

  const contentType = await environment.createContentTypeWithId(
    toCamelCase(params.name),
    contentTypeProps
  );

  return {
    content: [{ type: "text", text: JSON.stringify(contentType, null, 2) }],
  };
}
