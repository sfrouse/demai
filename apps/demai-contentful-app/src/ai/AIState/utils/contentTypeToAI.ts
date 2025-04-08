import { ContentType } from "contentful-management";

export default function contentTypeToAI(contentType: ContentType | undefined): {
  id: string;
  description: string;
  fields: { id: string; type: string }[];
} {
  if (!contentType) {
    return {
      id: "",
      description: "",
      fields: [],
    };
  }
  return {
    id: contentType.sys.id, // Keep only the content type ID
    description: contentType.description,
    fields: contentType.fields.map((field: any) => ({
      id: field.id,
      type: field.type,
      required: field.id === contentType.displayField,
    })), // Extract field IDs
  };
}
