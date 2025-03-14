import fs from 'fs';
import { COLOR_ROLE_IGNORE_LIST } from '../utils/constants.mjs';

export default function tailwindRender(
    dest, writeFileArr, defaultTokensWithCssProps
) {
    const tailwindDir = `${dest}/tailwind`;
    if (!fs.existsSync(tailwindDir)){
        fs.mkdirSync(tailwindDir, { recursive: true });
    }
    const tailwindConfig = {
        extend:{},
        fontSize: {},
        fontFamily: {},
        fontWeight: {}
    };

    // COLOR
    if (defaultTokensWithCssProps.color) {
        // icon will have to be background....
        if (defaultTokensWithCssProps.color.background) {
            tailwindConfig.backgroundColor = defaultTokensWithCssProps.color.background;
        }
        if (defaultTokensWithCssProps.color.icon) {
            tailwindConfig.fill = defaultTokensWithCssProps.color.icon;
        }
        if (defaultTokensWithCssProps.color.surface) {
            if (!tailwindConfig.backgroundColor) {
                tailwindConfig.backgroundColor = {};
            }
            tailwindConfig.backgroundColor.surface = defaultTokensWithCssProps.color.surface
        }
        if (defaultTokensWithCssProps.color.border) {
            tailwindConfig.borderColor = defaultTokensWithCssProps.color.border;
        }
        if (defaultTokensWithCssProps.color.text) {
            tailwindConfig.textColor = defaultTokensWithCssProps.color.text;
        }

        const colorsSansRole = {};
        Object.entries(defaultTokensWithCssProps.color).map(entry => {
            const name = entry[0];
            const value = entry[1];
            if (!COLOR_ROLE_IGNORE_LIST.includes(name)) {
                colorsSansRole[name] = value;
            }
        });
        tailwindConfig.extend.colors = colorsSansRole;
    }

    // === SPACING ==================
    if (defaultTokensWithCssProps.spacing) {
        // --- GAP ------------------
        if (defaultTokensWithCssProps.spacing.gap) {
            tailwindConfig.gap = defaultTokensWithCssProps.spacing.gap;
        }
        // --- PADDING --------------
        if (defaultTokensWithCssProps.spacing.padding) {
            tailwindConfig.padding = defaultTokensWithCssProps.spacing.padding;
        }
        // --- MARGIN ---------------
        if (defaultTokensWithCssProps.spacing.margin) {
            tailwindConfig.margin = {
                auto: 'auto',
                ...defaultTokensWithCssProps.spacing.margin
            }
        }
        // --- WIDTH / HEIGHT -------
        if (defaultTokensWithCssProps.spacing) {
            const spacingOnly = {};
            Object.entries(defaultTokensWithCssProps.spacing).map(entry => {
                const name = entry[0];
                const value = entry[1];
                if (typeof value === 'string') {
                    spacingOnly[name] = value;
                }
            });
            tailwindConfig.width = {
                auto: 'auto',
                full: '100%',
                screen: '100vw',
                ...spacingOnly
            }
            tailwindConfig.height = {
                auto: 'auto',
                full: '100%',
                screen: '100vh',
                ...spacingOnly
            }
        }
        // --- ICON WIDTH / HEIGHT -------
        if (defaultTokensWithCssProps.spacing.icon) {
            const iconSpacing = {};
            Object.entries(defaultTokensWithCssProps.spacing.icon).map(entry => {
                const name = entry[0];
                const value = entry[1];
                iconSpacing[`icon-${name}`] = value;
            });
            const prevWidth = tailwindConfig.width || {};
            tailwindConfig.width = {
                ...prevWidth,
                ...iconSpacing
            }
            const prevHeight = tailwindConfig.height || {};
            tailwindConfig.height = {
                ...prevHeight,
                ...iconSpacing
            }
        }
        // --- BORDER ---------------
        if (defaultTokensWithCssProps.spacing.border) {
            if (defaultTokensWithCssProps.spacing.border.radius) {
                tailwindConfig.borderRadius = defaultTokensWithCssProps.spacing.border.radius;
            }
            if (defaultTokensWithCssProps.spacing.border.width) {
                tailwindConfig.borderWidth = defaultTokensWithCssProps.spacing.border.width;
            }
        }
    }

    // MAX-CONTENT-WIDTH
    if (defaultTokensWithCssProps["max-content-width"]) {
        Object.entries(defaultTokensWithCssProps["max-content-width"]).map(entry => {
            const name = entry[0];
            const token = entry[1];
            if (!tailwindConfig.extend.maxWidth) tailwindConfig.extend.maxWidth = {};
            tailwindConfig.extend.maxWidth[`max-content-width-${name}`] = token;
        });
    }

    // COMPONENTS
    const components = {};
    // Typography Components
    if (defaultTokensWithCssProps.type) {
        Object.entries(defaultTokensWithCssProps.type).map(entry => {
            const name = entry[0];
            const token = entry[1];
            if (name === 'family') {
                tailwindConfig.fontFamily = {};
                Object.entries(token).map(familyToken => {
                    tailwindConfig.fontFamily[familyToken[0]] = familyToken[1];
                });
            }else if (name === 'weight') {
                tailwindConfig.fontWeight = {};
                Object.entries(token).map(weightToken => {
                    tailwindConfig.fontWeight[weightToken[0]] = weightToken[1];
                });
            }else if (
                name.indexOf('viewport-padding') === 0
            ) {
                if (!tailwindConfig.padding) tailwindConfig.padding = {};
                tailwindConfig.padding = {
                    ...tailwindConfig.padding,
                    [name]: token,
                }
            }else {
                renderTypeComponent(token, components, ['type', name])
            }
        });
    }

    // Component Tokens...one by one by one
    if (defaultTokensWithCssProps.button) {
        if (defaultTokensWithCssProps.button.radius) {
            components[`.button-radius`] = {
                "border-radius":  defaultTokensWithCssProps.button.radius
            };
        }
    }

    // THEME CSS
//     writeFileArr.push(fs.promises.writeFile(
//         `${tailwindDir}/theme.ts`,
//         `const theme = ${JSON.stringify(tailwindConfig, null, 2)};\nexport default theme;`
//     ));

//     // COMPONENT PLUGINS
//     writeFileArr.push(fs.promises.writeFile(
//         `${tailwindDir}/plugins.ts`,
//         `const plugin = require('tailwindcss/plugin');
// const plugins = [
//     plugin(({addComponents}: any) => addComponents(${JSON.stringify(components, null, 2)}))
// ];
// export default plugins;`
//     ));

    writeFileArr.push(fs.promises.writeFile(
        `${tailwindDir}/preset.ts`,
        `
const plugin = require('tailwindcss/plugin');
const preset = {
    plugins: [
        plugin(({addComponents}: any) => addComponents(${JSON.stringify(components, null, 2)}))
    ],
    theme: ${JSON.stringify(tailwindConfig, null, 2)}
};
export default preset;`
    ));
}


function renderTypeComponent(token, components, names) {
    Object.entries(token).map(entry => {
        const name = entry[0];
        const childToken = entry[1];
        if (typeof childToken === 'string') {
            // ignore
        }else if (typeof childToken.font === 'string') {
            const finalValue = {
                font: childToken.font
            };
            // if (childToken.lineheight) {
            //     finalValue.lineHeight = childToken.lineheight;
            // }
            components[`.${[...names, name].join('-')}`] = finalValue;
        }else{
            renderTypeComponent(childToken, components, [...names, name]);
        }
    });
}