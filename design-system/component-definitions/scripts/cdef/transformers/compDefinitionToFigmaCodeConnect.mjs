import { logError } from "../../log.mjs";

export default function compDefitionToFigmaCodeConnect(
    cdef,
    className,
    relativePath
) {
    if (!cdef) return '';
    const xCDef = cdef['x-cdef'];
    if (!xCDef) return '';
    const tag = xCDef.tag || cdef.$id;
    const name = xCDef.name || tag;
    const figmaComponent = xCDef.figma?.component;

    if (!figmaComponent) {
        logError(`No Figma Comp found for ${tag}`, false)
        return '';
    }

    // process variables...
    const props = ['{'];
    const attributes = [];
    const exampleProps = ['{'];
    if (cdef.properties) {
        Object.entries(cdef.properties).map(entry => {
            const name = entry[0];
            const property = entry[1];
            if (['$schema', '$identifier'].indexOf(name) !== -1) return;
            const xCDef = property['x-cdef'];
            if (xCDef.hidden === true) return;
            if (xCDef.output?.webComponent?.slot === true) return;
            if (xCDef.input?.options) {
                let enums = JSON.stringify(xCDef.input?.options, null, '\t');
                enums = enums.split('\n').join('\n\t\t');
                props.push(`\t\t'${name}': figma.enum("${name}", ${enums}),`);
            }else{
                const figmaTypeFunk = cdefTypeToFigmaType(property.type);
                props.push(`\t\t'${name}': figma.${figmaTypeFunk}("${name}"),`);
            }
            exampleProps.push(`\t${name}: any,`);
            attributes.push(`${name}={props.${name}}`);
        });
        props.push('\t}');
        exampleProps.push('}');
    }

    const importStr = xCDef.import ? xCDef.import.replace(/'/g, '\\\'') : '';

    return `import React from "react";
import figma from "@figma/code-connect";
import { ${className} } from '${relativePath}/${className}';

// AUTO-GENERATED do not edit
figma.connect(
  ${className},
  "${figmaComponent}",
  {
    props: ${props.join('\n')},
    imports: ['${importStr}'],
    example: (props: ${exampleProps.join('\n\t')}) =>
        <${tag}
            ${attributes.join('\n\t\t\t')}>
        </${tag}>,
  },
)

declare global {
    namespace JSX {
      interface IntrinsicElements {
          '${tag}': Partial<${className}>;
      }
    }
}`;
}


function cdefTypeToFigmaType(cdefType) {
    switch( cdefType ) {
        case 'string' :
            return 'string';
        case 'boolean' :
            return 'boolean';
        case 'number' :
            return 'number';
        default:
            return 'string'
    }
}