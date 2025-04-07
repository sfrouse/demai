export const PUBLISH_CONTENT_TYPE = "publish_content_type";

const publishContentTypeTool = {
  name: PUBLISH_CONTENT_TYPE,
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
