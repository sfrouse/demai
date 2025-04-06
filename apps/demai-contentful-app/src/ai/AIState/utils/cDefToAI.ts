interface SimplifiedContentType {
  id: string;
  class: string;
  description: string;
  properties: {
    [key: string]: string | string[];
  };
}

export default function cDefToAI(cDef: any): SimplifiedContentType {
  const simplified: SimplifiedContentType = {
    id: cDef["x-cdef"]?.tag || "",
    class: cDef["x-cdef"]?.className || "",
    description: cDef["x-cdef"]?.description || "",
    properties: {},
  };

  if (cDef.properties && typeof cDef.properties === "object") {
    for (const prop in cDef.properties) {
      // Skip meta properties that start with '$'
      if (prop.startsWith("$")) continue;

      const property = cDef.properties[prop];
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
