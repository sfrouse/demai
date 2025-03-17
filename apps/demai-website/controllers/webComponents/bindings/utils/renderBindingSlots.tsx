import { Entry } from "contentful";
import isObject from "./isObject";
import { SpaceParams } from "@/app/types";
import ComponentRenderer from "@/components/ComponentRenderer/ComponentRenderer";
import { BindingView } from "../types";

export default function renderBindingSlots(
  entry: Entry<any>,
  viewBindings: BindingView | undefined,
  params: SpaceParams,
  children: any[] = []
) {
  if (!viewBindings || !viewBindings.bindings) return children;

  Object.entries(entry.fields).forEach(([entryPropName, entryValue]) => {
    const binding = viewBindings.bindings.find(
      (b) => b.model === entryPropName
    );

    if (
      !binding ||
      typeof binding.view !== "object" ||
      !("slot" in binding.view)
    ) {
      return;
    }

    const slotName = binding.view.slot;

    if (Array.isArray(entryValue)) {
      const subChildren: any[] = entryValue.map((entryValueChild) => (
        <ComponentRenderer
          key={`wc-${entry.sys.id}-${entryValueChild.sys.id}`}
          entry={entryValueChild}
          params={params}
        />
      ));

      children.push(
        <div
          key={`wc-${entry.sys.id}-${slotName}`}
          slot={slotName === "default" ? undefined : slotName}
        >
          {subChildren}
        </div>
      );
    } else if (isObject(entryValue)) {
      children.push(
        <div
          key={`wc-${entry.sys.id}-${slotName}`}
          slot={slotName === "default" ? undefined : slotName}
        >
          <ComponentRenderer
            key={`wc-${entry.sys.id}-${entryValue.sys.id}`}
            entry={entryValue}
            params={params}
          />
        </div>
      );
    }
  });

  return children;
}
