import { Asset, Entry } from "contentful";
import isObject from "./isObject";
import { Binding, BindingView } from "../types";

export default function findBindingEntryReplacements(
  entry: Entry<any>,
  viewBindings: BindingView | undefined
): Entry<any> | false {
  if (!viewBindings) return false;
  let replacementEntry: Entry<any> | false = false;
  Object.entries(entry.fields).find(([entryPropName, entryValue]) => {
    const binding = viewBindings.bindings.find(
      (b) => b.model === entryPropName
    ) as Binding;
    if (
      binding &&
      typeof binding.view === "object" &&
      binding.view !== null &&
      "replace" in binding.view &&
      binding.view.replace === true
    ) {
      if (isObject(entryValue) && (entryValue as any).nodeType !== "document") {
        replacementEntry = processEntry(entryValue);
        return replacementEntry;
      } else if (Array.isArray(entryValue)) {
        // take the last one...
        const entryValueArr = entryValue as (Entry<any> | Asset)[];
        if (entryValueArr.length === 0) return false;
        const lastOne = entryValueArr[entryValueArr.length - 1];
        replacementEntry = processEntry(lastOne);
        return replacementEntry;
      }
    }
  });

  return replacementEntry;
}

function processEntry(entryValue: any) {
  const valueEntry = entryValue as Entry<any> | Asset;
  if (valueEntry.sys.type === "Asset") return false;
  return entryValue;
}
