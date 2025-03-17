import contentfulAliasTokenCheck from "../contentful/contentfulAliasTokenCheck.mjs";
import contentfulDimensionTokenCheck from "../contentful/contentfulDimensionTokenCheck.mjs";
import findTokenNameMetrics from "./findTokenNameMetrics.mjs";
import postProcessTokens from "./postProcessTokens.mjs";

function figmaRGBToHex(r, g, b) {
    const to255 = (value) => Math.round(value * 255);
    return `#${to255(r).toString(16).padStart(2, "0")}${to255(g).toString(16).padStart(2, "0")}${to255(b).toString(16).padStart(2, "0")}`.toUpperCase();
}

export default function createTokensByMode(tokens, prefix) {
    const tokensByMode = {};
    const valueMapping = {}; // complex to simple value mapping 
    const contentfulTokens = {
        sizing: {},
        spacing: {},
        color: {},
        border: {},
        fontSize: {},
        lineHeight: {},
        letterSpacing: {},
        textColor: {},
        borderRadius: {},
    };
    let remBase;
    tokens.collections.find(collection => {
        return collection.modes.find(mode => {
            return mode.tokens.find(token => {
                if (token.name === 'rem-base') {
                    remBase = token.value;
                    return true;
                }
                return false;
            });
        })
    });

    tokens.collections.map(collection => {
        const collectionName = collection.name;
        collection.modes.map((mode, modeIndex) => {
            const modeLookupName = modeIndex === 0 ? 'default' : mode.name;

            !tokensByMode[modeLookupName] ? tokensByMode[modeLookupName] = {} : null;
            const tokenNode = tokensByMode[modeLookupName];

            mode.tokens.map(token => {
                const {
                    tokenNameArr,
                    tokenLeafName,
                } = findTokenNameMetrics(
                    token.name,
                    collection.name,
                    prefix
                );

                // create missing objects
                let tokenNodeTarget = tokenNode;
                tokenNameArr.map(segment => {
                    if (!tokenNodeTarget[segment]) tokenNodeTarget[segment] = {};
                    tokenNodeTarget = tokenNodeTarget[segment];
                });

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
                        tokenNodeTarget[tokenLeafName] = colorStr;
                        break;
                    case 'ALIAS' : 
                        const aliasNameMetrics = findTokenNameMetrics(
                            token.value.variableName,
                            token.value.collectionName,
                            prefix
                        );
                        tokenNodeTarget[tokenLeafName] = aliasNameMetrics.tokenCSSProperty;
                        contentfulAliasTokenCheck(
                            modeIndex,
                            collectionName,
                            token,
                            contentfulTokens,
                            prefix,
                        );
                        break;
                    case 'BOOLEAN' :
                        // not sure what this would be in css
                        tokenNodeTarget[tokenLeafName] = token.value ? '1' : '0';
                        break;
                    case 'STRING' :
                        tokenNodeTarget[tokenLeafName] = token.value;
                        break;
                    case 'DIMENSION' : {
                        const isPixel = (token.name.indexOf('breakpoint') === 0);
                        if (remBase && !isPixel) {
                            const em = token.value / remBase;
                            tokenNodeTarget[tokenLeafName] = `${em.toFixed(4)}rem`;
                        }else{
                            tokenNodeTarget[tokenLeafName] = `${token.value}px`;
                        }
                        contentfulDimensionTokenCheck(
                            modeIndex,
                            collectionName,
                            token,
                            contentfulTokens,
                            prefix // aliasNameMetrics
                        );
                        break;
                    }
                    case 'INT' :
                    case 'FLOAT' :
                        tokenNodeTarget[tokenLeafName] = `${token.value}`;
                        break;
                }

                // const varName = `var( --${prefix}-${tokenNameArr.join('-')} )`;
                if (token.type === 'COLOR') {
                    valueMapping[tokenNodeTarget[tokenLeafName]] = figmaRGBToHex(token.value.r, token.value.g, token.value.b);
                    valueMapping[tokenLeafName] = valueMapping[tokenNodeTarget[tokenLeafName]];
                    // valueMapping[varName] = valueMapping[tokenNodeTarget[tokenLeafName]];
                }else if (token.type === 'ALIAS') {
                    valueMapping[tokenNodeTarget[tokenLeafName]] = valueMapping[tokenLeafName];
                    // valueMapping[varName] = tokenNodeTarget[tokenLeafName];
                }else{
                    valueMapping[tokenNodeTarget[tokenLeafName]] = token.value;
                    valueMapping[tokenLeafName] = valueMapping[tokenNodeTarget[tokenLeafName]];
                    // valueMapping[varName] = valueMapping[tokenNodeTarget[tokenLeafName]];
                }
            });
        });
    });

    // Typography Clustering
    postProcessTokens( tokensByMode, valueMapping );

    // clone and create simplier tokensByMode;
    let simpleTokensByMode = {...tokensByMode};
    simpleTokensByMode = replaceValuesWithMapping( simpleTokensByMode, valueMapping );

    return {
        remBase,
        tokensByMode,
        contentfulTokens,
        simpleTokensByMode
    }
}

function replaceValuesWithMapping(obj, valueMapping) {
    if (typeof obj === "string") {
        // If the value exists in the mapping, replace it
        return valueMapping[obj] ?? obj;
    } else if (Array.isArray(obj)) {
        // If it's an array, recursively replace values in the array
        return obj.map(item => replaceValuesWithMapping(item, valueMapping));
    } else if (typeof obj === "object" && obj !== null) {
        // If it's an object, recursively replace values in the object's properties
        return Object.fromEntries(
            Object.entries(obj).map(([key, value]) => [key, replaceValuesWithMapping(value, valueMapping)])
        );
    }
    return obj;
}

