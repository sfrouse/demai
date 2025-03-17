// import findOrCreateDefinition from "./findOrCreateDefinition";

export default function defineStageCss() {//args?: {
//   css?: string,
// } | string) {
  // The cDef doesn't build in production...
  if ((globalThis as any).CDEF_ACTIVE !== true) return;

  // let css;
  // if (typeof args === 'string') {
  //   css = args;
  // }else{
  //   css = args?.css;
  // }

  return function() {//target: any) {
    // const cls = target;
    // const params = findOrCreateDefinition(cls);
    // if (!params['x-cdef']) params['x-cdef'] = {stage: {css: ''}}
    // params['x-cdef'].stage.css = css;
  }
}