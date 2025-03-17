import define from "./define";

export default function defineHidden(
  title: string,
  property: string
): any | void {
  // The cDef doesn't build in production...
  if ((globalThis as any).CDEF_ACTIVE !== true) return;

  // defaults for slot
  let defineArgs = {
    hidden: true
  };

  const defineFunk = define(title, defineArgs);

  return function(target: any) {
    // const cls = target;
    // defineFunk({constructor: cls}, property);
    defineFunk ? defineFunk(target.prototype, property) : null;
  }
}