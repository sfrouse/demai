import applyClassJSDocValues from "./decoratorProcessing/applyClassDecoratorValues.mjs";
import getDefineComponentDecorator from "./decoratorProcessing/getDefineComponentDecorator.mjs";
import propertyParse from "./propertyParse.mjs";

export default async function classParse( cls ) {
    const decorators = cls.getDecorators();
    let tag = '';
    decorators.map(decorator => {
        const name = decorator.getName();
        // Comp Name
        if (name === 'customElement') {
            const firstArg = decorator.getArguments()[0];
            tag = firstArg.getLiteralValue();
        }
    });

    // Initial JSON
    const compDefinition = {
        $id: `${tag}.cdef.json`,
        $schema: 'https://json-schema.org/draft-07/schema',
        $comment: "AUTO GENERATED, DO NOT EDIT",
        type: "object",
        additionalProperties: false,
        "x-cdef": {
          tag,
          className: cls.getName(),
        },
        properties: {
          "$schema": {type: "string"},
          "$identifier" : {type: ["string", "object"]},
        },
    };

    // Define Component Decorator
    const defineCompDecoratorInfo = getDefineComponentDecorator(cls);
    applyClassJSDocValues( defineCompDecoratorInfo, compDefinition );

    // Properties
    const properties = cls.getInstanceProperties();
    for (const property of properties) {
        propertyParse(property, compDefinition);
    }

    return compDefinition;
}

