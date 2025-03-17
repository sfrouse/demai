


export default function compDefitionToStorybook(
    cdef,
    className,
    relativePath,
    examplesContent
) {
    if (!cdef) return '';
    const xCDef = cdef['x-cdef'];
    if (!xCDef) return '';
    const tag = xCDef.tag || cdef.$id;
    const name = xCDef.name || tag;
    const figmaComponent = xCDef.figma?.component;

    const argTypes = [];
    const attributes = [];
    const typeProps = [];
    const styleRules = [];
    const args = [];
    if (cdef.properties) {
        Object.entries(cdef.properties).map(entry => {
            const name = entry[0];
            const property = entry[1];
            if (['$schema', '$identifier'].indexOf(name) !== -1) return;
            const xCDef = property['x-cdef'];
            if (xCDef.hidden === true) return;
            if (xCDef.output?.webComponent?.slot === true) return;

            const defaultValue = xCDef.input?.defaultValue;
            if (xCDef.design === true) {
                const cssProp = xCDef.output.webComponent.cssProperty;
                styleRules.push(`\${props.${name} ? \`${cssProp}: \${props.${name}};\` : '/* no ${cssProp} */'}`);
            }else{
                if (property.type === 'boolean') {
                    attributes.push(`?${name}=\${props.${name}}`);
                }else{
                    attributes.push(`${name}=\${props.${name}}`);
                }
            }

            if (property.enum) {
                argTypes.push(`'${name}': {
                control: { type: 'select' },
                options: ${JSON.stringify(property.enum)},
            },`);
            }else{
                argTypes.push(`'${name}': {control: {type: '${cdefTypeToStorybookType(property.type)}'}},`);
            }

            typeProps.push(`${name}: ${property.type},`);

            if (defaultValue !== undefined && defaultValue !== '') {
                if (property.type === 'boolean') {
                    args.push(`'${name}': ${defaultValue},`);
                }else{
                    args.push(`'${name}': '${defaultValue}',`);
                }
            }
        });
    }

    const stories = [];
    const design = figmaComponent ? {
        type: 'figma',
        url: figmaComponent
    } : '';
    if (examplesContent) {
        Object.entries(examplesContent).map(entry => {
            const name = entry[0];
            const example = entry[1];
            example.$schema = undefined;
            stories.push(renderExample(name, example, design));
        });
    } else {
        stories.push(renderExample('Default Story', {}, design))
    }


    // TODO: slots
    return `import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
// import { ${className} } from '${relativePath}/${className}';

// AUTO-GENERATED do not edit
type ${className}Props = {
\t${typeProps.join('\n\t')}
}

type Story = StoryObj<${className}Props>;

const meta = {
    title: '${name}',
    tags: ['autodocs'],
    render: (props : ${className}Props ) => {
      return html\`
        <${tag}
            style="
                ${styleRules.join('\n\t\t')
            }"
            ${attributes.join('\n\t\t\t')}>
        </${tag}>
      \`;
    },
    argTypes: {
        ${argTypes.join('\n\t\t')}
    },
    args: {
        ${args.join('\n\t\t')}
    }
} satisfies Meta<${className}Props>;
export default meta;

${stories.join('\n')}
`
}

function cdefTypeToStorybookType(cdefType) {
    switch( cdefType ) {
        case 'string' :
            return 'text';
        case 'boolean' :
            return 'boolean';
        case 'number' :
            return 'number';
        default:
            return 'text'
    }
}

function renderExample(name, example, design) {
    const designStr = design ? 
        `\n\t\tdesign: ${JSON.stringify(design, null, '\t').split('\n').join('\n\t\t')},` : '';

    return `export const ${makeSafeClassName(name)}: Story = {
    parameters: {
        layout: 'centered',${designStr}
    },
    args: ${JSON.stringify(example, null, '\t').split('\n').join('\n\t')},
};`
}

function makeSafeClassName(str) {
    if (!str) {
        return 'Class'; // Default class name if input is empty
    }

    // Regular expression to test if the string starts with a letter, underscore, or dollar sign
    const startsWithLetterOrOtherValid = /^[a-zA-Z_$]/;
    
    // Regular expression to remove all invalid characters
    const removeInvalidChars = /[^a-zA-Z0-9_$]/g;

    // Check if the string starts correctly or prepend an underscore
    const validStart = startsWithLetterOrOtherValid.test(str.charAt(0)) ? '' : '_';

    // Create a safe class name
    const safeName = validStart + str.replace(removeInvalidChars, '');

    // List of reserved words in JavaScript (not exhaustive for brevity)
    const reservedWords = new Set(['class', 'return', 'function', 'var', 'const', 'let', 'if', 'else', 'switch']);

    // Check if the resulting name is a reserved word
    if (reservedWords.has(safeName)) {
        return '_' + safeName; // Prepend an underscore if it's a reserved word
    }

    // If the name becomes empty due to removal, default to 'Class'
    return safeName || 'Class';
}

