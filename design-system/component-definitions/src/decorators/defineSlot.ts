import define, { DefineArgs } from "./define";

export default function defineSlot(
  title: string,
  property: string,
  args? : DefineArgs,
): any | void {
  // The cDef doesn't build in production...
  if ((globalThis as any).CDEF_ACTIVE !== true) return;

  // defaults for slot
  let defineArgs = {
    slot: true,
    content: true // experimental smart default...
  };
  if (args)  {
    defineArgs = {
      ...defineArgs,
      ...args
    }
  }
  const defineFunk = define(title, defineArgs);

  return function(target: any) {
    // const cls = target;
    // defineFunk({constructor: cls}, property);
    defineFunk ? defineFunk(target.prototype, property) : null;
  }
}