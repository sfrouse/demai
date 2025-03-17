
export default function tokensToScss(token, prefix, fullName, css) {
    const cssArr = css || []; 
    if (typeof token === "string") {
        const prefixStr = prefix ? `${prefix}-` : '';
        cssArr.push(`$${prefixStr}${fullName}: ${token};`);
    }else{
        Object.entries(token).map(entry => {
            const name = entry[0];
            const value = entry [1];
            tokensToScss(value, prefix, `${fullName ? `${fullName}-` : ''}${name}`, cssArr);
        });
    }
    return cssArr;
}
