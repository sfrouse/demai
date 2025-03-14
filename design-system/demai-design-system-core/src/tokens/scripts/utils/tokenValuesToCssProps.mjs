

export default function tokenValuesToCssProps(
    tokens, prefix
) {
    const cssPropsTokens = {};
    valueToCssProp(tokens, prefix, [], cssPropsTokens);
    return cssPropsTokens;
}

function valueToCssProp(tokens, prefix, nameArr, cssPropsTokens) {
    Object.entries(tokens).map(token => {
        const name = token[0];
        const value = token[1];
        if (!cssPropsTokens[name]) {
            cssPropsTokens[name] = {};
        }
        const targetCssProps = cssPropsTokens[name];
        if (typeof value === 'string') {
            const prefixStr = prefix ? `${prefix}-` : '';
            cssPropsTokens[name] = `var( --${prefixStr}${[...nameArr, name].join('-')} )`;
        }else{
            valueToCssProp(value, prefix, [...nameArr, name], targetCssProps);
        }
    });
}