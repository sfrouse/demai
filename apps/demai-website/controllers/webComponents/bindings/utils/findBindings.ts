import "../index";
import { BindingView, ModelBindings } from "../types";

export default function findBindings(key: string): ModelBindings | undefined {
  if (typeof globalThis !== "undefined") {
    const globalThisAny = globalThis as any;
    const bindings = globalThisAny.websiteBindings;
    if (bindings) {
      const entryBindings = bindings[key];
      return entryBindings;
    }
  }
}

export function findViewBindings(
  key: string,
  webComp: string | undefined
): BindingView | undefined {
  if (typeof globalThis !== "undefined") {
    const globalThisAny = globalThis as any;
    const bindings = globalThisAny.websiteBindings;
    if (bindings) {
      const entryBindings = bindings[key];
      if (entryBindings) {
        const viewBindings = webComp
          ? entryBindings.views.find((view: BindingView) => view.id === webComp)
          : entryBindings.views.find((view: BindingView) => view.default); // Get the default view
        return viewBindings;
      }
    }
  }
}
