import { CDefDesignPropertyEnum } from "../types";
import define from "./define";

export default function defineDesignProperty(
  designProperty: CDefDesignPropertyEnum,
  // args? : DefineArgs,
): any | void {
  // The cDef doesn't build in production...
  if ((globalThis as any).CDEF_ACTIVE !== true) return;

  const defineFunk = define(
    camelToTitleCase(designProperty),
    {
      designProperty,
      inputType: designProperty as any,
      attribute: camelToSnakeCase(designProperty)
    }
  );
  return function(target: any) {
    defineFunk ? defineFunk(target.prototype, designProperty) : null;
  }
}

function camelToTitleCase(inputString: string) {
  var words = inputString.split(/(?=[A-Z])/);
  return words.map(function(word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
}

function camelToSnakeCase(inputString: string) {
  var words = inputString.split(/(?=[A-Z])/);
  return words.map(function(word) {
      return word.charAt(0).toLowerCase() + word.slice(1);
  }).join('-');
}