import {
    ALIAS_LOOKUP,
    COLOR_IGNORE_LIST,
    SEMANTIC_COLOR_COLLECTION,
    SEMANTIC_SPACING_COLLECTION,
    TOKEN_BACKGROUND_PREFIX,
    TOKEN_BORDER_PREFIX,
    TOKEN_BORDER_RADIUS_SUFFIX,
    TOKEN_TEXT_PREFIX
} from "../utils/constants.mjs";
import findTokenNameMetrics from "../utils/findTokenNameMetrics.mjs";


export default function contentfulAliasTokenCheck(
    modeIndex,
    collectionName,
    token,
    contentfulTokens,
    prefix, // aliasNameMetrics,
) {

    const aliasNameMetrics = findTokenNameMetrics(
        token.name,
        collectionName,
        prefix
    );

    if (
        modeIndex === 0 &&
        collectionName === SEMANTIC_COLOR_COLLECTION &&
        COLOR_IGNORE_LIST.filter(filter => {
            return token.name.lastIndexOf(filter) === (token.name.length - filter.length);
        }).length === 0
    ) {
        // will have to look up value later...
        
        const lookupValue = aliasNameMetrics.tokenCSSProperty;
        // const lookupValue = `${ALIAS_LOOKUP}${aliasNameMetrics.tokenFullName}`;
        
        if (token.name.indexOf(TOKEN_BACKGROUND_PREFIX) === 0) {
            const name = token.name
                .replace(TOKEN_BACKGROUND_PREFIX, '')
                .replace('/default', '')
                .replace(/\//g, '-');
            contentfulTokens.color[name] = lookupValue;
        }else if (token.name.indexOf(TOKEN_TEXT_PREFIX) === 0) {
            const name = token.name
                .replace(TOKEN_TEXT_PREFIX, '')
                .replace('/default', '')
                .replace(/\//g, '-');
            if (
                name.indexOf('-inverted') === -1 &&
                name.indexOf('on-surface') === -1
            ) {
                contentfulTokens.textColor[name] = lookupValue;
            }
        }else if (token.name.indexOf(TOKEN_BORDER_PREFIX) === 0) {
            const name = token.name
                .replace(TOKEN_BORDER_PREFIX, '')
                .replace('/default', '')
                .replace(/\//g, '-');
            if (
                name.indexOf('-inverted') === -1 &&
                name.indexOf('on-surface') === -1
            ) {
                contentfulTokens.border[name] = {
                    width: '1px',
                    style: 'solid',
                    color: lookupValue
                }
            }
        }
    }

    if (
        modeIndex === 0 &&
        collectionName === SEMANTIC_SPACING_COLLECTION
    ) {
        // will have to look up value later...
        // const lookupValue = `${ALIAS_LOOKUP}${aliasNameMetrics.tokenFullName}`;
        if (token.name.indexOf(TOKEN_BORDER_RADIUS_SUFFIX) === 0) {
            const name = token.name
                .replace(TOKEN_BORDER_RADIUS_SUFFIX, '')
                .replace('/default', '')
                .replace(/\//g, '-');
            contentfulTokens.borderRadius[name] = aliasNameMetrics.tokenCSSProperty;// lookupValue;
        }
    }
}