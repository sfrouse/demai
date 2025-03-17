import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import { Entry } from "contentful";
import isObject from "./isObject";

export default function entryToAttributes(
  entry: Entry<any>,
  config: any,
  attrs: { [key: string]: any } = {}
) {
  const entryContentTypeId = entry.sys.contentType.sys.id;
  Object.entries(entry.fields).forEach(([entryPropName, entryValue]) => {
    const mapName = `${entryContentTypeId}.${entryPropName}`;
    if (
      config.mappings &&
      config.mappings[mapName] &&
      !Array.isArray(entryValue)
    ) {
      const mapValue = config.mappings[mapName];
      if (isObject(mapValue)) return;
      let attrName = mapValue;
      if (Array.isArray(mapValue)) {
        if (mapValue[1]) {
          entryValue = mapValue[1](entryValue);
        }
        attrName = mapValue[0];
      }
      // Dynamically create the regex using the variable
      const pattern = new RegExp(`${config.tag}\\.`);
      attrName = attrName.replace(pattern, "");

      if (isObject(entryValue) && (entryValue as any).nodeType === "document") {
        attrs[attrName] = documentToHtmlString(entryValue);
      } else {
        attrs[attrName] = entryValue;
      }
    }
  });

  return attrs;
}
