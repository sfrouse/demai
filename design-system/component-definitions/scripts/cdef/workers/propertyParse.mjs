import getDefineDecorator from "./decoratorProcessing/getDefineDecorator.mjs";
import litPropDecorators from "./decoratorProcessing/litPropDecorators.mjs";
import getDefaultValue from "./getDefaultValue.mjs";
// import getPropertyJSDocValues from "./jsDocsProcessing/getPropertyJSDocValues.mjs";
import processEnum from "./processEnum.mjs";

export default function propertyParse(
    property,
    compDefinition
) {
    const title = property.getName();
    // const defineInfo = getPropertyJSDocValues(property);
    const defineInfo = getDefineDecorator(property);
    
    // Initial JSON
    const propertyDef = {
        $schema: 'https://json-schema.org/draft-07/schema',
        title: defineInfo.label || title,
        type: "string",
        description: defineInfo.description,
        ["x-cdef"]: {
            input: {
                label: defineInfo.label || title,
                inputType: 'string',
            },
            output: {
                webComponent: {
                    attribute: title
                }
            }
        }
    };

    // Content Flag
    if (defineInfo.content) {
        propertyDef["x-cdef"].content = {content: defineInfo.content}; 
    }

    // Default Value
    const defaultValue = getDefaultValue(property);
    if (defaultValue !== undefined && defaultValue !== null) {
        propertyDef["x-cdef"].input.defaultValue = defaultValue;
    }

    // Property Type
    const propertyType = property.getType();
    let propertyTypeFinal = 'string';
    if (propertyType.isString()) propertyTypeFinal = 'string';
    if (propertyType.isBoolean()) propertyTypeFinal = 'boolean';
    if (propertyType.isObject()) propertyTypeFinal = 'object';
    if (propertyType.isNumber()) propertyTypeFinal = 'number';
    propertyDef.type = propertyTypeFinal;
    propertyDef["x-cdef"].input.inputType = propertyTypeFinal;
    if (defineInfo.max && defineInfo.min) {
        propertyDef.maximum = defineInfo.max;
        propertyDef.minimum = defineInfo.min;
        propertyDef["x-cdef"].input.inputType = 'slider';
    }

    // Enums
    const enumResults = processEnum(property);
    if (enumResults) {
        propertyDef.enum = enumResults.enumValues;
        propertyDef["x-cdef"].input.options = enumResults.options;
        propertyDef["x-cdef"].input.inputType = 'select';
    }

    // Attribute
    const litDecorators = litPropDecorators(property);
    if (litDecorators.attribute) {
        propertyDef["x-cdef"].output.webComponent.attribute = litDecorators.attribute;
    }

    // Finish: Add Property
    compDefinition.properties[title] = propertyDef;
}