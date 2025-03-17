import findOrCreateDefinition from "./utils/findOrCreateDefinition";
import stringToCDefId from "./utils/stringToCDefId";

export default function defineExample(
  name: string,
  ref: string,// example id
  description : string = '',
): any | void {
  // The cDef doesn't build in production...
  if ((globalThis as any).CDEF_ACTIVE !== true) return;

  return function(target: any) {
    const cls = target;
    const definition = findOrCreateDefinition(cls);
    if (!definition["x-cdef"]) return;
    if (!definition["x-cdef"].examples) {
      definition["x-cdef"].examples = [];
    }
    // They run in reverse order, so unshift instead of push
    // want to keep the order of the decorators
    definition["x-cdef"].examples.unshift({
      name,
      description,
      $id: stringToCDefId(ref, true)
    });
  }
}