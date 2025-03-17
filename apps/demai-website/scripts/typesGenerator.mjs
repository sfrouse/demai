import {
  CFDefinitionsBuilder,
  V10ContentTypeRenderer,
} from "cf-content-types-generator";
import pkg from "contentful-management";
const { createClient } = pkg;
import * as fs from "fs";
import dotenv from "dotenv";
// Load environment variables from .env file
dotenv.config();

(async () => {
  // Initialize Contentful Management API client
  const client = createClient({
    accessToken: process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN, // Content Management API Token
  });

  // Fetch content types from Contentful
  const space = await client.getSpace(process.env.CONTENTFUL_SOURCE_SPACE_ID);
  const environment = await space.getEnvironment("master"); // Replace 'master' with your environment ID if different
  const contentTypes = await environment.getContentTypes();

  // Create CFDefinitionsBuilder and Renderer
  const builder = new CFDefinitionsBuilder([
    new V10ContentTypeRenderer(),
  ]).appendTypes(contentTypes.items);

  // Specify the output path and write to file
  fs.writeFileSync(
    `./@types/generated/contentful-types.${process.env.CONTENTFUL_SOURCE_SPACE_ID}.d.ts`,
    builder.toString(),
    "utf8"
  );

  fs.writeFileSync(
    `./@types/generated/contentful-types.d.ts`,
    `export * from "./contentful-types.${process.env.CONTENTFUL_SOURCE_SPACE_ID}.d.ts";\n`,
    "utf8"
  );

  // console.log(`Contentful types generated at: ${outputPath}`);
})();
