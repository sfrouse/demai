
import { CDefDefinition, CDefDefinitionType } from "../../types";
import { DefineArgs } from "../define";
import findOrCreateDefinition from "../utils/findOrCreateDefinition";
import typeToInputType from "./typeToInputType";

export default function captureDefaultsViaSetter(
    target: any,
    propertyKey: string,
    overrides?: DefineArgs
) {
    const originalDescriptor = Object.getOwnPropertyDescriptor(target, propertyKey);

    // a setter that only runs once...
    const setter =  function (newValue: any) {
      const cls = target.constructor;
      const definition = findOrCreateDefinition(cls);
      if (!definition || !definition.properties) return;
      const property: CDefDefinition = definition?.properties[propertyKey];
      let newType: CDefDefinitionType = 'string';
      if (property) {
        switch (typeof newValue) {
          case "string" :
            newType = "string";
            break;
          case "bigint" :
          case "number" :
            newType = "number";
            break;
          case "boolean" :
            newType = "boolean";
            break;
          case "function" :
          case "object" :
            newType = "object";
            break;
          case "symbol" :
          case "undefined" :
            // assume the default...
            newType = "string";
            break;
        }
      }
     
      // let the argument win
      property.type = overrides?.type !== undefined ? 
        overrides?.type : newType;
      if (property["x-cdef"]?.input) {
        property["x-cdef"].input.defaultValue = newValue;
        property["x-cdef"].input.inputType = overrides?.inputType !== undefined ? 
          overrides?.inputType : typeToInputType(property);
      }

      // finish up
      if (originalDescriptor && originalDescriptor.set) {
        originalDescriptor.set.call(target, newValue);

        // revert immediately...we only want the first one.
        Object.defineProperty(target, propertyKey, {
          get: originalDescriptor.get,
          set: originalDescriptor.set,
          enumerable: true,
          configurable: true,
        });
      }
    };

    // Redefine the property with the new getter and setter
    Object.defineProperty(target, propertyKey, {
      get: () => {},// no need for getter...it's reverted right away,
      set: setter,
      enumerable: true,
      configurable: true,
    });
  }