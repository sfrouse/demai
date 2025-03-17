import { ALIAS_SEPERATOR } from "./constants.mjs";

export default function findTokenNameMetrics(
    tokenName,
    collectionName,
    prefix
) {
    const tokenNameArr = tokenName?.split('/');
    const tokenLeafName = tokenNameArr.pop();
    if (collectionName.toLowerCase().indexOf('semantic') === 0) {
        const collNameArr = collectionName.split(' ');
        if (collNameArr.length > 1) {
            const prefix = collNameArr[1].toLowerCase();
            tokenNameArr.unshift(prefix);
        }
    }
    // there can be dashes in real names, so need a different sepearator
    const tokenFullName = `${tokenNameArr.join(ALIAS_SEPERATOR)}${ALIAS_SEPERATOR}${tokenLeafName}`;
    const tokenCSSName = `${tokenNameArr.join('-')}-${tokenLeafName}`;
    return {
        tokenNameArr,
        tokenLeafName,
        tokenFullName,
        tokenCSSProperty : `var( --${prefix ? `${prefix}-`: ''}${tokenCSSName} )`
    }
}

export function findTokenNameSSSSMetrics(
    tokenName,
    collectionName,
    prefix
) {
    const tokenNameArr = tokenName?.split('/');
    const tokenLeafName = tokenNameArr.pop();
    if (collectionName.toLowerCase().indexOf('semantic') === 0) {
        const collNameArr = collectionName.split(' ');
        if (collNameArr.length > 1) {
            const prefix = collNameArr[1].toLowerCase();
            tokenNameArr.unshift(prefix);
        }
    }
    // there can be dashes in real names, so need a different sepearator
    const tokenFullName = `${tokenNameArr.join(ALIAS_SEPERATOR)}${ALIAS_SEPERATOR}${tokenLeafName}`;
    const tokenCSSName = `${tokenNameArr.join('-')}-${tokenLeafName}`;
    return {
        tokenNameArr,
        tokenLeafName,
        tokenFullName,
        tokenCSSProperty : `var( --${prefix ? `${prefix}-`: ''}${tokenCSSName} )`
    }
}


