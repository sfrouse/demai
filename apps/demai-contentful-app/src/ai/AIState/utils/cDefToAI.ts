interface SimplifiedContentType {
  id: string;
  class: string;
  properties: {
    [key: string]: string | string[];
  };
}

export default function cDefToAI(contentType: any): SimplifiedContentType {
  const simplified: SimplifiedContentType = {
    id: contentType["x-cdef"]?.tag || "",
    class: contentType["x-cdef"]?.className || "",
    properties: {},
  };

  if (contentType.properties && typeof contentType.properties === "object") {
    for (const prop in contentType.properties) {
      // Skip meta properties that start with '$'
      if (prop.startsWith("$")) continue;

      const property = contentType.properties[prop];
      // If the property has an "enum" array, use that.
      if (property.enum && Array.isArray(property.enum)) {
        simplified.properties[prop] = property.enum;
      } else if (property.type && typeof property.type === "string") {
        simplified.properties[prop] = property.type;
      }
    }
  }
  return simplified;
}
