


export default function tokensToTypeScriptReferences(
    tsTokens,
    prefix,
    name,
    fullName,
    typescript,
    renderPrimitives = false
) {
    const finalTypescript = typescript || {};
    if (typeof tsTokens === "string" || typeof tsTokens === "number") {
        if (name) {
            if (renderPrimitives) {
                finalTypescript[name] = tsTokens;
            }else{
                const prefixStr = prefix ? `${prefix}-` : '';
                finalTypescript[name] = `var( --${prefixStr}${fullName} )`;
            }
        }
    }else{
        if (name) {
            finalTypescript[name] = {};
        }
        Object.entries(tsTokens).map(entry => {
            const entryName = entry[0];
            const value = entry [1];
            // first one is the mode
            const finalFullName = `${fullName ? `${fullName}-` : ''}${entryName}`;
            tokensToTypeScriptReferences(
                value,
                prefix,
                entryName,
                finalFullName,
                finalTypescript[name] || finalTypescript,
                renderPrimitives
            );
        });
    }
    return finalTypescript;
}