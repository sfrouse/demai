import { ModelBindings } from "../types";

export default function setBindings(
  bindings: {
    [key: string]: ModelBindings;
  },
  replaceAll: boolean = false
) {
  if (typeof globalThis !== "undefined") {
    const globalThisAny = globalThis as any;
    if (!globalThisAny.websiteBindings) {
      globalThisAny.websiteBindings = {};
    }
    if (replaceAll) {
      globalThisAny.websiteBindings = bindings;
    } else {
      globalThisAny.websiteBindings = {
        ...globalThisAny.websiteBindings,
        ...bindings,
      };
    }
  }
}
