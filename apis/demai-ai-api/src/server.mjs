import { createTransport } from "@smithery/sdk/transport.js"
const transport = createTransport("https://server.smithery.ai/@ivotoby/contentful-management-mcp-server", {
  "managementToken": "Contentful Content Management API token",
  "host": "Contentful Management API endpoint",
  "spaceId": "Optional Contentful Space ID",
  "environmentId": "Optional Contentful Environment ID"
})
// Create MCP client
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
const client = new Client({
	name: "Test client",
	version: "1.0.0"
})
await client.connect(transport)
// Use the server tools with your LLM application
const tools = await client.listTools()
console.log(`Available tools: ${tools.map(t => t.name).join(", ")}`)
// Example: Call a tool
// const result = await client.callTool("tool_name", { param1: "value1" })