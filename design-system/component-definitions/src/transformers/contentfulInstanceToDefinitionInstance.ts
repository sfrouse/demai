import { Entry } from "contentful";
import { COMPONENT_INSTANCE_PROPERTY } from "../constants";
import getComponentDefinition from "./utils/getComponentDefinition";
import { CDefInstance, CDefTokenLookup } from "../types";
import { findGlobalViaTokenLookup } from "../utils/findViaTokenLookup";
import getComponentDefinitionTokenLookup from "./utils/getComponentDefinitionTokenLookup";

export default async function contentfulInstanceToDefinitionInstance(
  entry: Entry | undefined,
  cDefPath: string
): Promise<CDefInstance | undefined> {
  if (!entry) return;
  // the only differences are decorating the content properties to the properties

  if (entry.fields === undefined && (entry as any).sys?.type === "Link") {
    console.error("Entry is a link...load it first");
    return;
  }

  const compInstance: CDefInstance = entry.fields[
    COMPONENT_INSTANCE_PROPERTY
  ] as CDefInstance;
  if (!compInstance) {
    console.error(
      `${COMPONENT_INSTANCE_PROPERTY} not found on entry:`,
      entry.sys.id
    );
    return;
  }

  const tokenLookup = await getComponentDefinitionTokenLookup(cDefPath);
  const compDefinition = await getComponentDefinition(
    cDefPath,
    compInstance.$schema as string | undefined
  );
  if (!compDefinition) {
    console.error(
      `Component Definition not found`,
      cDefPath,
      compInstance.$schema
    );
    return;
  }

  // compiler is having issues with destructuring in Figma
  const finalInstance = JSON.parse(JSON.stringify(compInstance));
  if (!compDefinition.properties) return;
  await Promise.all(
    Object.entries(compDefinition.properties).map((propertyInfo) => {
      return (async () => {
        const name = propertyInfo[0];

        // special properties
        if (name === "$schema") return;
        if (name === "$identifier") {
          finalInstance[name] = { contentful: entry.sys.id };
          // "$identifier": {
          //     "contentful": "1OQsuY37z6xSJnEUDKXphg"
          // },
          return;
        }

        const property = propertyInfo[1];
        if (
          // TODO: figure out if this should automatically map to field versus config...
          property["x-cdef"]?.content?.content === true &&
          entry &&
          entry.fields[name]
        ) {
          let finalValue: any = entry.fields[name];
          if (Array.isArray(finalValue)) {
            const finalValueArr = await Promise.all(
              finalValue.map((value) => {
                return _findValue(value, cDefPath, tokenLookup);
              })
            );
            finalValue = finalValueArr;
          } else {
            finalValue = await _findValue(finalValue, cDefPath, tokenLookup);
          }
          finalInstance[name] = finalValue;
        } else {
          if (name.indexOf("_") === 0) {
            finalInstance[name] = await _findValue(
              finalInstance[name],
              cDefPath,
              tokenLookup
            );
          }
        }
      })();
    })
  );

  return finalInstance;
}

async function _findValue(
  value: any,
  cDefPath: string,
  tokenLookup?: CDefTokenLookup
) {
  let finalValue: any = value;
  if (
    finalValue &&
    finalValue.fields &&
    finalValue.fields[COMPONENT_INSTANCE_PROPERTY]
  ) {
    finalValue = await contentfulInstanceToDefinitionInstance(value, cDefPath);
  }
  finalValue = findGlobalViaTokenLookup(finalValue, tokenLookup);
  return finalValue;
}
