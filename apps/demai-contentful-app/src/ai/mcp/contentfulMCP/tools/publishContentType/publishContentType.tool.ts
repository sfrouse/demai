const publishContentTypeTool = {
  name: "publish_content_type",
  description: "Publish a content type",
  inputSchema: {
    type: "object",
    properties: {
      contentTypeId: {
        type: "string",
        description: "The id of the content type, never the name.",
      },
    },
    required: ["contentTypeId"],
  },
};

export default publishContentTypeTool;
