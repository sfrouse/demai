export default function bindingInjection(bindings: any[], other: string) {
  if (!bindings) return "";

  // need this server and client side...
  if (typeof globalThis !== "undefined") {
    const globalThisAny = globalThis as any;
    if (!globalThisAny.websiteBindings) {
      globalThisAny.websiteBindings = {};
    }

    bindings.map((binding: any) => {
      globalThisAny.websiteBindings[binding.modelId] = binding;
    });
  }

  return `
        if (typeof globalThis !== "undefined") {
            const globalThisAny = globalThis;
            if (!globalThisAny.websiteBindings) {
                globalThisAny.websiteBindings = {};
            }
            ${bindings
              .map((binding: any) => {
                return `globalThisAny.websiteBindings['${binding.modelId}'] = ${JSON.stringify(binding, null, 2)}`;
              })
              .join(";\n")}
        }

        ${other}
    `;
}
