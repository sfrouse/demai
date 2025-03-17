import findOrCreateDefinition from "./utils/findOrCreateDefinition";
import typeToInputType from "./define/typeToInputType";
import captureDefaultsViaSetter from "./define/captureDefaultsViaSetter";
import stringToCDefId from "./utils/stringToCDefId";
import {
  // CDefApplyTo,
  // CDefApplyToProperty,
  CDefDefinition,
  CDefDefinitionInputType,
  CDefDefinitionType,
  CDefDesignPropertyEnum,
} from "../types";

export type DefineArgs = {
  max?: number;
  min?: number;
  type?: CDefDefinitionType;
  inputType?: CDefDefinitionInputType | CDefDesignPropertyEnum;
  items?: {
    // only with array
    type?: CDefDefinitionType;
    ref?: string; // reference to another cdef
  };
  ref?: string; // reference to another cdef
  description?: string;
  options?: any[] | { [key: string]: any };
  test?: any[] | { [key: string]: any };
  attribute?: string;
  content?: boolean;
  slot?: boolean;
  defaultSlot?: boolean;
  hidden?: boolean;
  designProperty?: CDefDesignPropertyEnum;
  // applyTo?: CDefApplyToProperty | CDefApplyTo
};

export default function define(
  title: string,
  args?: DefineArgs
  // exploring combining decorators...
  // assumes too much knowledge of other decorators
  // decorators: Function[] = []
) {
  // The cDef doesn't build in production...
  if ((globalThis as any).CDEF_ACTIVE !== true)
    return (target: any, propertyKey: string) => {
      return { target, propertyKey };
    };
  // if ((globalThis as any).CDEF_ACTIVE !== true) return;

  // JSchema
  let optionValues: any, finalOptions: any;

  const {
    description,
    type,
    inputType,
    ref,
    items,
    options,
    max,
    min,
    attribute,
    content = false,
    slot = false,
    defaultSlot = false,
    hidden = false,
    designProperty,
    // applyTo
  } = args || {};

  if (options) {
    if (Array.isArray(options)) {
      optionValues = options;
      finalOptions = {};
      options.map((optionVal) => {
        finalOptions[optionVal] = optionVal;
      });
    } else {
      // is object
      optionValues = Object.values(options);
      finalOptions = options;
    }
  }

  return function (target: any, propertyKey: string) {
    let typeOverride = type;
    const cls = target.constructor;
    const definition = findOrCreateDefinition(cls);
    const property: CDefDefinition = {
      $schema: "https://json-schema.org/draft-07/schema",
      title,
      description,
      maximum: max,
      minimum: min,
      ["x-cdef"]: {
        input: {
          label: title,
          inputType: "string",
        },
        output: {
          webComponent: {
            attribute: attribute || propertyKey,
          },
        },
      },
    };

    const cdef: any = property["x-cdef"];
    const output = cdef.output;
    const input = cdef.input;

    // set default w/o changing overide or type default
    property.type = type || "string";
    if (ref !== undefined) {
      property.$ref = stringToCDefId(ref);
      typeOverride = "object";
      property.type = typeOverride;
    }
    if (type === "array" || items !== undefined) {
      typeOverride = "array";
      property.type = typeOverride;
      property.items = {
        type: items?.type || "string",
      };
      if (items?.ref !== undefined) {
        property.items.type = "object";
        property.items.$ref = stringToCDefId(items.ref);
      }
    }
    if (slot === true || defaultSlot === true) output.webComponent.slot = true;
    if (defaultSlot === true) output.webComponent.defaultSlot = true;

    if (content === true) cdef.content = { content };

    if (designProperty !== undefined) output.designProperty = designProperty;

    if (max !== undefined) property.maximum = max;
    if (min !== undefined) property.minimum = min;
    if (hidden === true) cdef.hidden = true;
    if (optionValues) {
      property.enum = optionValues;
      input.options = finalOptions;
    }

    cdef.input.inputType = inputType || typeToInputType(property);

    // one time setter to get default properties
    captureDefaultsViaSetter(target, propertyKey, {
      ...args,
      type: typeOverride, // in case we had an override
      inputType, // it's checked for again in setter
    });

    // add to properties...
    if (definition.properties) definition.properties[propertyKey] = property;
  };
}
