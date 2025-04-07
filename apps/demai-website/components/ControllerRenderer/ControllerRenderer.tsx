import { createElement } from "react";

export default function ControllerRenderer({
  controller,
}: {
  controller: any;
}) {
  const isObject = (value: any): boolean => {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  };
  const camelToKebab = (str: string): string => {
    return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
  };

  const view = controller?.fields?.["view"];
  if (!view) return null;
  const tagName = view.sys.contentType.sys.id;
  const attrs = { ...view.fields };
  const bindings = controller.fields.bindings;
  const children = controller.fields.children;
  if (bindings) {
    bindings.map((binding: any) => {
      const model = binding.fields.model;
      const bindings = binding.fields.bindings;
      if (model && bindings) {
        bindings.map((bindingInfo: any) => {
          if (isObject(bindingInfo.model)) {
            const modelValue = model.fields[bindingInfo.model.property];
            if (modelValue) {
              attrs[bindingInfo.view.property] = modelValue;
            }
          } else {
            const modelValue = model.fields[bindingInfo.model];
            if (modelValue) {
              attrs[bindingInfo.view] = modelValue;
            }
          }
        });
      }
    });
  }

  let childrenArray = [];
  if (children) {
    childrenArray = children.map((child: any) => (
      <ControllerRenderer key={child.sys.id} controller={child} />
    ));
  }

  const finalAttrs = Object.fromEntries(
    Object.entries(attrs).map(([key, value]) => [camelToKebab(key), value])
  );
  return createElement(tagName, finalAttrs, childrenArray);
}
