
export default function tokensToCss(tsTokens, prefix, fullName, css) {
    const cssArr = css || []; 
    if (typeof tsTokens === "string") {
        const prefixStr = prefix ? `${prefix}-` : '';
        cssArr.push(`--${prefixStr}${fullName}: ${tsTokens};`);
    }else{
        Object.entries(tsTokens).map(entry => {
            const name = entry[0];
            const value = entry [1];
            tokensToCss(value, prefix, `${fullName ? `${fullName}-` : ''}${name}`, cssArr);
        });
    }
    return cssArr;
}