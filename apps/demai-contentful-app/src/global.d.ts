declare module "demai-design-system-core/src/tokens/scripts/transformTokens";
declare module "demai-design-system-core/src/tokens/tokens/dmo.tokens.json";
declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}

declare module "@ivotoby/contentful-management-mcp-server" {
  export class ModelContextProtocol {
    constructor(params: { client: any; modelContextContentTypeId: string });
    listModelContexts(): Promise<any[]>;
    createModelContext(params: {
      contentType: string;
      metadata: { description: string; createdAt: string };
    }): Promise<any>;
  }
}
