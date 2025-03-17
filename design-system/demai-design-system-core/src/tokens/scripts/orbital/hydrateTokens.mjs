export default async function hydrateTokens(
    tokens, prefix
) {
    const hydratedTokens = {};
    for (const collection of tokens.collections) {
        // for (const mode of collection.modes) {
        collection.modes.forEach((mode, modeIndex) => {  // Get mode index
            for (const token of mode.tokens) {
                const {
                    keys,
                    cssRoot,
                    globalKey,
                    hydratedToken
                } = createKeys(
                    token,
                    prefix,
                    hydratedTokens
                );
                
                // OUTPUT
                if (!hydratedToken.outputs[mode.name]) hydratedToken.outputs[mode.name] = {};

                let tokenValue = findTokenValue(token);
                let figmaValue = tokenValue;
                if (tokenValue.type === 'VARIABLE_ALIAS') {
                    tokenValue = `var( --${nameToCSSRoot(tokenValue.variableName, prefix)} )`;
                    figmaValue = `variable:${tokenValue.variableName}`;
                }

                const output = hydratedToken.outputs[mode.name];
                output.figma = `set ${keys.figma} = ${figmaValue};`;
                output.css = `--${cssRoot}: ${tokenValue};`;
                output.scss = `$${cssRoot}: ${keys.css};`;
                output.js = `${globalKey.toUpperCase()}: '${keys.css}'`;
                output.json = `"${globalKey}": "${keys.css}"`;
                output.jsonPrimitive = `"${globalKey}": "${tokenValue}"`;
                output.option = `${globalKey.toUpperCase()}: '${globalKey}'`;

                const values = hydratedToken.values;
                values.cssProperty = keys.css;

                // TODO: figure out complexity of modes here
                // if (!values.cssValue) values.cssValue = {};
                // values.cssValue[mode.name] = tokenValue;
                if (modeIndex === 0) {
                    values.cssValue = tokenValue;
                }
            }
        });
    }

    for (const style of tokens.styles) {
        const {
            keys,
            cssRoot,
            globalKey,
            hydratedToken
        } = createKeys(
            style,
            prefix,
            hydratedTokens
        );

        // OUTPUT
        const output = {};
        hydratedToken.outputs['default'] = output;

        const tokenValue = `var( --${
            nameToCSSRoot(style.fontWeight, prefix)
        } ) var( --${
            nameToCSSRoot(style.fontSize, prefix)
        } )/var( --${
            nameToCSSRoot(style.lineHeight, prefix)
        } ) var( --${
            nameToCSSRoot(style.fontFamily, prefix)
        } )`;
        const figmaValue = {
            weight: `variable:${style.fontWeight}`,
            size: `variable:${style.fontSize}`,
            lineHeight: `variable:${style.lineHeight}`,
            family: `variable:${style.fontFamily}`,
        }

        output.figma = `set ${keys.figma} = ${figmaValue};`;
        output.css = `--${cssRoot}: ${tokenValue};`;
        output.scss = `$${cssRoot}: ${keys.css};`;
        output.js = `${globalKey.toUpperCase()}: '${keys.css}'`;
        output.json = `"${globalKey}": "${keys.css}"`;
        output.jsonPrimitive = `"${globalKey}": "${tokenValue}"`;
        output.option = `${globalKey.toUpperCase()}: '${globalKey}'`;

        const values = hydratedToken.values;
        values.cssProperty = keys.css;
        values.figma = figmaValue;
    }

    return hydratedTokens;
}


function createKeys(
    styleOrToken,
    prefix,
    hydratedTokens
) {

    const name = styleOrToken.name;
    const type = styleOrToken.type;

    let globalKey = name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    if (prefix) {
        globalKey = `${prefix}_${globalKey}`;
    }
    if (!hydratedTokens[globalKey]) {
        hydratedTokens[globalKey] = {keys:{}, outputs:{}, values:{}};
    }
    const hydratedToken = hydratedTokens[globalKey];

    // ROOTS
    const cssRoot = nameToCSSRoot(name, prefix);

    // KEYS
    const keys = hydratedToken.keys;
    keys.global = globalKey;
    keys.css = `var(--${cssRoot})`;
    if (type === 'textStyle') {
        const style = styleOrToken;
        keys.figma = `style:${name}`;
        keys.figmaComposite = {
            weight: `variable:${style.fontWeight}`,
            size: `variable:${style.fontSize}`,
            lineHeight: `variable:${style.lineHeight}`,
            family: `variable:${style.fontFamily}`,
        }
    }else{
        keys.figma = `variable:${name}`;
    }
    keys.js = globalKey.toUpperCase();
    keys.path = type === "textStyle" ? name.split('-') : name.split('/');

    return {keys, cssRoot, globalKey, hydratedToken};
}


function findTokenValue(token, remBase = false) {
    switch (token.type) {
        case 'COLOR' :
            const alpha = `${((token.value.a / 1  * 1000) / 1000 ).toFixed(2)}`;
            const colorStr = `rgba( ${
                    Math.round((token.value.r / 1 ) * 255)
                }, ${
                    Math.round((token.value.g / 1 ) * 255)
                }, ${
                    Math.round((token.value.b / 1 ) * 255)
                }, ${
                    alpha === '1.00' ? '1' : alpha
                } )`;
            return colorStr;
        case 'ALIAS' :
            // let the other side figure out reference...
            return token.value;
        case 'BOOLEAN' :
            // not sure what this would be in css
            return token.value ? '1' : '0';
        case 'STRING' :
            return token.value;
        case 'DIMENSION' :
            const isPixel = (token.name.indexOf('breakpoint') === 0);
            if (remBase && !isPixel) {
                const em = token.value / remBase;
                return `${em.toFixed(4)}rem`;
            }else{
                return `${token.value}px`;
            }
        case 'INT' :
        case 'FLOAT' :
            return `${token.value}`;
    }
};

function nameToCSSRoot(name, prefix) {
    const cssName = name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    return `${prefix ? `${prefix}-` : ''}${cssName}`;
}