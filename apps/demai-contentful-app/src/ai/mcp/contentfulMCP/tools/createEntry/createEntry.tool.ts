const createEntryTool = {
  name: "create_entry",
  description: `
Create a new entry in Contentful, you will need to know the content type information 
which may be given to you or by using the GET_CONTENT_TYPE tool.
All content fields must go inside the \`fields\` object.
Example:
{
  contentTypeId: "article",
  fields: {
    title: "My Title",
    body: "Main content",
    tags: ["news", "tech"]
  }
}.`,
  inputSchema: {
    type: "object",
    properties: {
      contentTypeId: {
        type: "string",
        description: "The ID of the content type for the new entry",
      },
      fields: {
        type: "object",
        description: `
The fields or properties of the entry that are determined by the content type.
Make sure that the right data type is used.
Everything and anything describing this entry beyond the contentTypeId should be put within this object.
All content fields go here. DO NOT place these at the root. Each key in this object should match a field ID in the content type.

Correct:
{
  contentTypeId: "blogPost",
  fields: {
    title: "My Post",
    body: "Hello world",
    price: 19.55
  }
}

Incorrect:
{
  contentTypeId: "blogPost",
  title: "My Post", // ❌ Wrong
  body: "Hello world" // ❌ Wrong
  price: "19.55" // ❌ Wrong 
}
`,
        additionalProperties: true,
      },
    },
    required: ["contentTypeId", "fields"],
  },
};

export default createEntryTool;
