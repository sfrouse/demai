import { ContentType } from "contentful-management";

export default function contentTypeToAI(contentType: ContentType): {
  id: string;
  fields: string[];
} {
  return {
    id: contentType.sys.id, // Keep only the content type ID
    fields: contentType.fields.map((field: any) => field.id), // Extract field IDs
  };
}
