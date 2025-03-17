import { ALIAS_LOOKUP, ALIAS_SEPERATOR } from "../utils/constants.mjs";

export default function contentfulPostProcess(
    defaultTokens, contentfulTokens, remBase
) {
    if (contentfulTokens) {
        Object.entries(contentfulTokens).map(entry => {
            const tokenName = entry[0];
            const value = entry[1];
            console.log('tokenName, value', tokenName, value);
            if (typeof value === 'string') {
                if (value.indexOf(ALIAS_LOOKUP) === 0) {
                    const name = value.substring(ALIAS_LOOKUP.length);
                    const nameArr = name.split(ALIAS_SEPERATOR);
                    const tokenValue = findTokenValueByNameArr(defaultTokens, nameArr, remBase);
                    contentfulTokens[tokenName] = tokenValue;
                }
            }else{
                contentfulPostProcess(defaultTokens, value, remBase);
            }            
        });
    }
}

function findTokenValueByNameArr(
    defaultTokens, nameArr, remBase
) {
    let target = defaultTokens;
    nameArr.map(name => {
        if (target[name] !== undefined) {
            target = target[name];
        }else{
            // console.log('defaultTokens', defaultTokens);
            console.error(`COULD NOT FIND ${nameArr}`);
            target = 'not found';
        }
    });

    // Contentful can't deal with ems...
    if (typeof target === 'string' && remBase && target.indexOf('em') === target.length - 2) {
        const unRemedNumber = parseFloat(target.substring(0, target.length-2)) * remBase;
        return `${unRemedNumber}px`;
    }
    return target;
}