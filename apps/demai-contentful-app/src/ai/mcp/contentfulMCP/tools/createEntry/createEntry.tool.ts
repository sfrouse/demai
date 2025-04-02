const createEntryTool = {
  name: "create_entry",
  description:
    "Create a new entry in Contentful, before executing this function, you need to know the contentTypeId (not the content type NAME) and the fields of that contentType, you can get the fields definition by using the GET_CONTENT_TYPE tool. ",
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
