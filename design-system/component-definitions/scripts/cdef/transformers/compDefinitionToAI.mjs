


export default function compDefitionToAI(cdef, clsName) {
    if (!cdef) return '';
    const xCDef = cdef['x-cdef'];
    const tag = xCDef?.tag || cdef.$id;
    // const name = xCDef?.name || tag;

    const studioCDef = {
        tag: tag,
        // name,
        // category: 'Components',
        // thumbnailUrl: '' // JSDoc needed
        // buildInStyles: [], // JSDoc needed
    };

    // process properties...
    if (cdef.properties) {
        const properties = {};
        Object.entries(cdef.properties).map(entry => {
            const name = entry[0];
            const property = entry[1];
            if (['$schema', '$identifier'].indexOf(name) !== -1) return;
            const xCDef = property['x-cdef'];

            if (xCDef.hidden === true) return;
            if (xCDef.output?.webComponent?.slot === true) {
                // studioCDef.children = true;
                return;
            }

            const newProperty = {
                type: property.type,
                // group: xCDef.output?.content?.content === true ? 'content' : 'style',
                // displayName: property.title,
                defaultValue: xCDef.input?.defaultValue || undefined,
            }
            if (xCDef.input?.options) { // property.enum) {
                const inValidations = [];
                Object.entries(xCDef.input.options).map(option => {
                    // const optionName = option[0];
                    const optionValue = option[1];
                    inValidations.push(optionValue);
                });
                newProperty.possibleValues = inValidations;
            }

            // add to properties
            properties[name] = newProperty;
        });

        // make sure it is the last property in the object
        studioCDef.properties = properties;
    }

    return `${JSON.stringify(studioCDef)}`;
}
