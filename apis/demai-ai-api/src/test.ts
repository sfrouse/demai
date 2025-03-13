import { createTransport } from "@smithery/sdk/transport.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

const transport = createTransport(
  // "http://localhost:3000",
  "https://server.smithery.ai/@ivotoby/contentful-management-mcp-server",
  {
    managementToken: "",
    host: "https://api.contentful.com",
    spaceId: "vpwi3ymt2kis",
    environmentId: "aitesting",
  }
);

async function main() {
  const client = new Client({
    name: "Test client",
    version: "1.0.0",
  });
  await client.connect(transport);

  // Use the server tools with your LLM application
  const tools = await client.listTools();
  console.log(`Available tools`, tools);

  const entry = await client.callTool({
    name: "get_entry",
    arguments: { entryId: "4UFenrUTDZxLniOnb1qyYZ" },
  });
  console.log("entry", entry);

  // Example: Call a tool
  // const result = await client.callTool("tool_name", { param1: "value1" })
}

main();
