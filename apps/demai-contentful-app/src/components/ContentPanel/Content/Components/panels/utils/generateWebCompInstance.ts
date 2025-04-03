type Schema = {
  "x-cdef": { tag: string };
  properties: {
    [key: string]: {
      type?: string | string[];
      title?: string;
      enum?: string[];
      "x-cdef"?: {
        input?: {
          options?: Record<string, string>; // Added options lookup
          defaultValue?: string;
        };
        output?: {
          webComponent?: {
            attribute?: string;
          };
        };
      };
    };
  };
};

export default function generateWebCompInstance(
  schema: Schema,
  params: Record<string, any> | undefined,
  toString: boolean = false
): string {
  if (!schema) return "";

  const tag = schema["x-cdef"].tag;
  const properties = schema.properties;

  const filterOutProps = ["disabled"]; // Add keys to ignore here

  const attributes = Object.entries(properties)
    .filter(
      ([key, value]) =>
        !filterOutProps.includes(key) &&
        value["x-cdef"]?.output?.webComponent?.attribute
    )
    .map(([key, value]) => {
      const attrName = value["x-cdef"]!.output!.webComponent!.attribute!;
      let attrValue: string = "";

      if (value.type === "string") {
        if (key.includes("image")) {
          attrValue = "https://picsum.photos/600/400";
        } else {
          attrValue =
            value["x-cdef"]?.input?.defaultValue ||
            Object.values(value["x-cdef"]?.input?.options ?? {})[0] ||
            `Example ${value.title}`;
        }
      } else if (Array.isArray(value.enum) && value.enum.length > 0) {
        attrValue = value["x-cdef"]?.input?.defaultValue || value.enum[0];
      }

      if (params && params[key]) {
        attrValue = params[key];
      }

      return `${attrName}="${attrValue}"`;
    })
    .join("\n    ");

  if (toString) {
    return `&lt;${tag}\n    ${attributes}\n&gt;&lt;/${tag}&gt;`;
  }
  return `<${tag}\n    ${attributes}\n></${tag}>`;
}
