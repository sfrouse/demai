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
  toString: boolean = false
): string {
  const tag = schema["x-cdef"].tag;
  const properties = schema.properties;

  const attributes = Object.entries(properties)
    .filter(([_, value]) => value["x-cdef"]?.output?.webComponent?.attribute)
    .map(([key, value]) => {
      const attrName = value["x-cdef"]!.output!.webComponent!.attribute!;
      let placeholderValue: string = "";

      if (value.type === "string") {
        if (key.includes("image")) {
          placeholderValue = "https://picsum.photos/600/400";
        } else {
          // Prioritize `defaultValue`, then first option from `options`, then title-based fallback
          placeholderValue =
            value["x-cdef"]?.input?.defaultValue ||
            Object.values(value["x-cdef"]?.input?.options ?? {})[0] ||
            `Example ${value.title}`;
        }
      } else if (Array.isArray(value.enum) && value.enum.length > 0) {
        placeholderValue =
          value["x-cdef"]?.input?.defaultValue || value.enum[0];
      }

      return `${attrName}="${placeholderValue}"`;
    })
    .join("\n    ");

  if (toString) {
    return `&lt;${tag}\n    ${attributes}\n&gt;&lt;/${tag}&gt;`;
  }
  return `<${tag}\n    ${attributes}\n></${tag}>`;
}
