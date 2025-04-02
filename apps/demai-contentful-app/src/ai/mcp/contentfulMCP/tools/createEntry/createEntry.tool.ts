const createEntryTool = {
  name: "create_entry",
  description: `
Create a new entry in Contentful, you will need to know the content type information 
which may be given to you or by using the GET_CONTENT_TYPE tool. Either way, you 
need to make sure to have as many of the fields filled out as possible.`,
  inputSchema: {
    type: "object",
    properties: {
      contentTypeId: {
        type: "string",
        description: "The ID of the content type for the new entry",
      },
      fields: { type: "object", description: "The fields of the entry" },
    },
    required: ["contentTypeId", "fields"],
  },
};

export default createEntryTool;
