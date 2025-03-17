import {
    PRIMITIVES_COLLECTION,
    SEMANTIC_SPACING_COLLECTION,
    SEMANTIC_TYPE_COLLECTION,
    TOKEN_BORDER_RADIUS_SUFFIX,
    TOKEN_SPACE_PREFIX,
    TOKEN_TEXT_LINE_HEIGHT_PREFIX,
    TOKEN_TEXT_SIZE_PREFIX
} from "../utils/constants.mjs";
import findTokenNameMetrics from "../utils/findTokenNameMetrics.mjs";

export default function contentfulDimensionTokenCheck(
    modeIndex,
    collectionName,
    token,
    contentfulTokens,
    prefix
) {

    const aliasNameMetrics = findTokenNameMetrics(
        token.name,
        collectionName,
        prefix
    );

    if (modeIndex !== 0) return;
    if (
        collectionName === PRIMITIVES_COLLECTION
    ) {
        if (token.name.indexOf(TOKEN_SPACE_PREFIX) === 0) {
            const name = token.name.replace(TOKEN_SPACE_PREFIX, '');
            contentfulTokens.spacing[name] = aliasNameMetrics.tokenCSSProperty; // `${token.value}px`;
        }    
    }
    if (collectionName === SEMANTIC_TYPE_COLLECTION) {
        if (
            token.name.lastIndexOf(TOKEN_TEXT_SIZE_PREFIX) ===
            token.name.length - TOKEN_TEXT_SIZE_PREFIX.length
        ) {
            const name = token.name
                .replace(TOKEN_TEXT_SIZE_PREFIX, '')
                .replace(/\//g, '-');
            contentfulTokens.fontSize[name] = aliasNameMetrics.tokenCSSProperty; // `${token.value}px`;
        }
        if (
            token.name.lastIndexOf(TOKEN_TEXT_LINE_HEIGHT_PREFIX) ===
            token.name.length - TOKEN_TEXT_LINE_HEIGHT_PREFIX.length
        ) {
            const name = token.name
                .replace(TOKEN_TEXT_LINE_HEIGHT_PREFIX, '')
                .replace(/\//g, '-');
            contentfulTokens.lineHeight[name] = aliasNameMetrics.tokenCSSProperty; // `${token.value}px`;
        }

        if (token.name === 'page-width') {
            contentfulTokens.sizing['page-width'] = aliasNameMetrics.tokenCSSProperty; // `${token.value}px`;
        } 
    }

    if (collectionName === SEMANTIC_SPACING_COLLECTION) {
        if (
            token.name.lastIndexOf(TOKEN_BORDER_RADIUS_SUFFIX) === 0
        ) {
            const name = token.name
                .replace(TOKEN_BORDER_RADIUS_SUFFIX, '')
                .replace(/\//g, '-');
            contentfulTokens.borderRadius[name] = aliasNameMetrics.tokenCSSProperty; // `${token.value}px`;
        }
    }
}