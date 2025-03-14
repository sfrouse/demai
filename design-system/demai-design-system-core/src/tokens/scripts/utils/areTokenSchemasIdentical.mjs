
export default function areTokenSchemasIdentical (
    tokensA, tokensB
) {
    // create a look up of names and then compare
    const tokensALookup = createNameLookup(tokensA);
    const tokensBLookup = createNameLookup(tokensB);

    const errors = [];
    Object.keys(tokensALookup).map(nameA => {
        if (tokensBLookup[nameA] !== true) {
            errors.push(`${tokensB.name} is missing '${nameA}'`);
        }
    });
    Object.keys(tokensBLookup).map(nameB => {
        if (tokensALookup[nameB] !== true) {
            errors.push(`${tokensA.name} is missing '${nameB}'`);
        }
    });
    return errors;
}

function createNameLookup(tokens) {
    const tokensLookup = {};
    tokens.collections.map((collection) => {
        const collectionName = collection.name;
        collection.modes.map((mode) => {
            const modeName = mode.name;
            mode.tokens.map((token) => {
                const nodeName = token.name;
                tokensLookup[`${collectionName}-${modeName}-${nodeName}`] = true;
            });
        });
    });
    return tokensLookup;
}