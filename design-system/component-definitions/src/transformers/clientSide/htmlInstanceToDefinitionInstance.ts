import { CDefInstance } from "../../types";
import getComponentDefinition from "../utils/getComponentDefinition";
// import getComponentDefinitionTokenLookup from "../utils/getComponentDefinitionTokenLookup";

export default async function htmlInstanceToDefinitionInstance(
  html: string | undefined,
  cDefPath: string,
  childHtmlElement?: Element
): Promise<CDefInstance | undefined> {
  if (!html && !childHtmlElement) return;

  // const tokenLookup = await getComponentDefinitionTokenLookup(cDefPath);

  let htmlElement: Element | undefined;
  if (childHtmlElement) {
    htmlElement = childHtmlElement;
  } else if (html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    if (!doc || !doc.body.children[0]) {
      console.log("did no find any children", doc);
      return;
    }
    htmlElement = doc.body.children[0];
  } else {
    console.log("[htmlInstanceToDefinitionInstance] NO HTML OR HTML CHILD");
    return;
  }

  // const htmlElement = doc.body.children[0];
  const compName = htmlElement.nodeName.toLowerCase();
  const compDefinition = await getComponentDefinition(cDefPath, compName);
  if (!compDefinition) {
    console.error(`Component Definition not found`, cDefPath, compName);
    return;
  }

  // process into cdef via compDef props
  const defInstance: any = {};
  defInstance["$schema"] = `${compName}.cdef.json`;
  let defaultSlotProperty: { [key: string]: any } | undefined;
  const otherSlotProperties: { [key: string]: any } = {};
  if (compDefinition.properties) {
    Object.entries(compDefinition.properties).map((entry) => {
      const name = entry[0];
      const prop = entry[1];
      // TODO: look for slots, output,
      if (htmlElement?.getAttribute(name)) {
        if (prop.type === "boolean") {
          defInstance[name] =
            htmlElement.getAttribute(name) === "false" ? false : true;
        } else {
          defInstance[name] = htmlElement.getAttribute(name);
        }
      }
      if (prop["x-cdef"]?.output?.webComponent?.slot === true) {
        if (prop["x-cdef"]?.output?.webComponent?.defaultSlot === true) {
          defaultSlotProperty = { [name]: prop };
        } else {
          otherSlotProperties[name] = prop;
        }
      }
    });
  }

  // process children into appropriate slots
  if (defaultSlotProperty) {
    const defaultSlotEntry = Object.entries(defaultSlotProperty);
    const defaultSlotName = defaultSlotEntry[0][0];
    const childDefinitions = [];
    for (const child of htmlElement.children) {
      const childCDef = await htmlInstanceToDefinitionInstance(
        undefined,
        cDefPath,
        child
      );
      childDefinitions.push(childCDef); // Store the result
    }
    defInstance[defaultSlotName] = childDefinitions;
  }

  return defInstance;
}
