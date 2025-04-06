import { createElement } from "react";

export default function ControllerRenderer({
  controller,
}: {
  controller: any;
}) {
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
          const modelValue = model.fields[bindingInfo.model];
          if (modelValue) {
            attrs[bindingInfo.view] = modelValue;
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

  return createElement(tagName, attrs, childrenArray);
}
