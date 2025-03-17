import { Asset, Entry } from "contentful";
import isObject from "./isObject";

export default function findEntryReplacements(
  entry: Entry<any>,
  config: any
): Entry<any> | false {
  const entryContentTypeId = entry.sys.contentType.sys.id;

  let replacementEntry: Entry<any> | false = false;
  Object.entries(entry.fields).find(([entryPropName, entryValue]) => {
    const mapName = `${entryContentTypeId}.${entryPropName}`;
    if (isObject(entryValue) && (entryValue as any).nodeType !== "document") {
      const valueEntry = entryValue as Entry<any> | Asset;
      if (valueEntry.sys.type === "Asset") return false;
      if (config.mappings[mapName]) {
        const mappingConfig = config.mappings[mapName];
        if (mappingConfig.replace === true) {
          replacementEntry = entryValue;
          return true;
        }
      }
    }
  });

  return replacementEntry;
}
