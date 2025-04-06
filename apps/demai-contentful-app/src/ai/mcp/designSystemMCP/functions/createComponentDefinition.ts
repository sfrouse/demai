// import { IMCPTool } from "../../MCPClient";
// import ensureDemAIComponentEntry from "./utils/demaiComponent/ensureDemAIComponentEntry";
// import { DesignSystemMCPClient } from "../DesignSystemMCPClient";

// export const CREATE_COMPONENT_DEFINITION_TOOL_NAME =
//   "create_component_definition";

// const createComponentDefinition: IMCPTool = {
//   toolName: CREATE_COMPONENT_DEFINITION_TOOL_NAME,
//   tool: {
//     type: "function",
//     function: {
//       name: CREATE_COMPONENT_DEFINITION_TOOL_NAME,
//       description:
//         "Creates a component definition that describes the interface for any kind of UI component such as a web component or Figma component.",
//       parameters: {
//         type: "object",
//         properties: {
//           id: {
//             type: "string",
//             description:
//               "The unique identifier for the component definition. It should lowercase, only letters and hyphens and always have a consistent prefix.",
//           },
//           name: {
//             type: "string",
//             description:
//               "A unique name of the component in a more user friendly way. It should generally be the id but with spaces and capital case.",
//           },
//           description: {
//             type: "string",
//             description:
//               "A description of what the component is and why you would use it.",
//           },
//           properties: {
//             type: "array",
//             description:
//               "Array of properties that describe the interface for the UI component",
//             items: {
//               type: "object",
//               properties: {
//                 id: {
//                   type: "string",
//                   description:
//                     "Unique relative to other properties, lowercase, no spaces, using letters or hyphens only that identifies this property.",
//                 },
//                 title: {
//                   type: "string",
//                   description:
//                     "The title of the property. Only allow alpha characters.",
//                 },
//                 type: {
//                   type: "string",
//                   description:
//                     "Describes what type of property it is (string, number, integer, boolean, object, array, null)",
//                   enum: [
//                     "string",
//                     "number",
//                     "integer",
//                     "boolean",
//                     "object",
//                     "array",
//                     "null",
//                   ],
//                 },
//                 description: {
//                   type: "string",
//                   description: "Describes what the property is for.",
//                 },
//                 enum: {
//                   type: "array",
//                   description:
//                     "If the property is limited to a specific set of strings, this defines them. An example would be like design should only be 'primary' or 'secondary'.",
//                   items: {
//                     type: "string",
//                   },
//                 },
//                 defaultValue: {
//                   type: "string",
//                   description:
//                     "If a default value makes sense, this will define it.",
//                 },
//               },
//               additionalProperties: false,
//               required: [
//                 "id",
//                 "title",
//                 "type",
//                 "description",
//                 "enum",
//                 "defaultValue",
//               ],
//             },
//             additionalProperties: false,
//             required: ["items"],
//           },
//         },
//         additionalProperties: false,
//         required: ["id", "name", "description", "properties"],
//       },
//     },
//   },
//   functionCall: async (mcp: DesignSystemMCPClient, params: any) => {
//     // TODO: type CDefDefinition
//     const cDef: any = {
//       $id: `${params.id}.cdef.json`,
//       $schema: "https://json-schema.org/draft-07/schema",
//       $comment: "AI GENERATED",
//       type: "object",
//       additionalProperties: false,
//       description: params.description,
//       "x-cdef": {
//         tag: params.id,
//         className: kebabToClassName(params.id),
//         name: params.name,
//       },
//       properties: {
//         $schema: {
//           type: "string",
//         },
//         $identifier: {
//           type: ["string", "object"],
//         },
//       },
//     };

//     params.properties.map((prop: any) => {
//       const cdefProp: any = {
//         $schema: "https://json-schema.org/draft-07/schema",
//         title: prop.title,
//         type: prop.type,
//         description: prop.description,
//         "x-cdef": {
//           input: {
//             label: prop.title,
//             //   inputType: "select",
//           },
//           output: {
//             webComponent: {
//               attribute: prop.id,
//             },
//           },
//         },
//       };

//       if (prop.enum) {
//         cdefProp.enum = prop.enum;
//         cdefProp["x-cdef"].input.options = {};
//         (prop.enum as []).map((enumValue: string) => {
//           // TODO: make the name more label like
//           cdefProp["x-cdef"].input.options[kebabToSentence(enumValue)] =
//             enumValue;
//         });
//       }
//       if (prop.defaultValue) {
//         cdefProp["x-cdef"].input.defaultValue = prop.defaultValue;
//       }

//       cDef.properties[prop.id] = cdefProp;
//     });

//     await ensureDemAIComponentEntry(
//       mcp.cma,
//       mcp.spaceId,
//       mcp.environmentId,
//       params.id,
//       {
//         title: params.name,
//         description: params.description,
//         componentDefinition: cDef,
//         // javascript: "",
//         // binding: { event: "click", action: "alert('Clicked!')" },
//       }
//     );

//     return {
//       content: [
//         {
//           type: "object",
//           text: `${JSON.stringify(cDef)}`,
//         },
//       ],
//     };
//   },
// };

// function kebabToSentence(kebab: string): string {
//   return kebab
//     .replace(/-/g, " ") // Replace hyphens with spaces
//     .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize the first letter of each word
// }

// function kebabToClassName(kebab: string): string {
//   return kebab
//     .split("-") // Split by hyphens
//     .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
//     .join(""); // Join words without spaces
// }

// export default createComponentDefinition;
