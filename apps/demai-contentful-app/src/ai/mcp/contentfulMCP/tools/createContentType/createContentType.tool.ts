export const CREATE_CONTENT_TYPE = "create_content_type";

const createEntryTool = {
  name: CREATE_CONTENT_TYPE,
  description: `
Create a new content type in Contentful.
A content type in Contentful is like a template or blueprint for your content that describes ideas or content that is important to a website or brand.
It defines the structure by specifying the fields (e.g., text, media, references) that entries of that type will have.
For example, a “Blog Post” content type might include fields like title, body, author, and publish date.
Every entry created from this type will follow that same structure.`,
  inputSchema: {
    type: "object",
    properties: {
      name: { type: "string" },
      fields: {
        type: "array",
        description: "Array of field definitions for the content type",
        items: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "The ID of the field",
            },
            name: {
              type: "string",
              description: "Display name of the field",
            },
            type: {
              type: "string",
              description:
                "Type of the field (Text, Number, Date, Location, Media, Boolean, JSON, Link, Array, etc)",
              enum: [
                "Symbol",
                "Text",
                "Integer",
                "Number",
                "Date",
                "Location",
                "Object",
                "Boolean",
                "Link",
                "Array",
              ],
            },
            required: {
              type: "boolean",
              description: "Whether this field is required",
              default: false,
            },
            localized: {
              type: "boolean",
              description: "Whether this field can be localized",
              default: false,
            },
            linkType: {
              type: "string",
              description:
                "Required for Link fields. Specifies what type of resource this field links to",
              enum: ["Entry", "Asset"],
            },
            items: {
              type: "object",
              description:
                "Required for Array fields. Specifies the type of items in the array",
              properties: {
                type: {
                  type: "string",
                  enum: ["Symbol", "Link"],
                },
                linkType: {
                  type: "string",
                  enum: ["Entry", "Asset"],
                },
                validations: {
                  type: "array",
                  items: {
                    type: "object",
                  },
                },
              },
            },
            validations: {
              type: "array",
              description: "Array of validation rules for the field",
              items: {
                type: "object",
              },
            },
          },
          required: ["id", "name", "type"],
        },
      },
      description: { type: "string" },
      displayField: {
        type: "string",
        description:
          "the *ID* of the field that should be used as the default display title in lists and such. Do not use the name of the field, use the id of an existing field.",
      },
    },
    required: ["name", "fields", "displayField"],
  },
};

export default createEntryTool;
