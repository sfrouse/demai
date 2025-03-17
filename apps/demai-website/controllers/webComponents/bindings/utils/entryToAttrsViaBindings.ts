import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import { Entry } from "contentful";
import { Binding, BindingView } from "../types";
import isObject from "./isObject";
import { SpaceParams } from "@/app/types";

export default function entryToAttrsViaBindings(
  entry: Entry<any>,
  viewBindings: BindingView | undefined,
  params: SpaceParams,
  attrs: { [key: string]: any } = {}
) {
  if (!viewBindings) return attrs;

  Object.entries(entry.fields).forEach(([entryPropName, entryValue]) => {
    const binding = viewBindings.bindings.find(
      (b) => b.model === entryPropName
    ) as Binding;

    if (!binding || Array.isArray(entryValue)) return;

    if (typeof binding.view === "string") {
      attrs[binding.view] = entryValue;
    } else if (Array.isArray(binding.view)) {
      const [attrName, transformFn] = binding.view;
      attrs[attrName] = transformFn
        ? transformFn(entryValue, params)
        : entryValue;
    } else if (isObject(binding.view) && "slot" in binding.view) {
      // Skip slot-based bindings
    } else if (isObject(binding.view) && "replace" in binding.view) {
      // Skip processing for replace
    }

    if (isObject(entryValue) && (entryValue as any).nodeType === "document") {
      attrs[binding.view as string] = documentToHtmlString(entryValue);
    }
  });

  return attrs;
}
