import { CDefTokenLookup, CDefTokenLookupKeys } from "../types";

export function findGlobalViaTokenLookup(
    value: string | undefined,
    tokenLookup?: CDefTokenLookup
) {
    const keys = _findKeysViaTokenLookup(value, tokenLookup);
    if (
        keys &&
        typeof keys === 'object' &&
        keys.global
    ) {
        return keys.global;
    }
    return value;
}

export function findCSSViaTokenLookup(
    value: string | undefined,
    tokenLookup?: CDefTokenLookup
) {
    const keys = _findKeysViaTokenLookup(value, tokenLookup);
    if (
        keys &&
        typeof keys === 'object' &&
        keys.css
    ) {
        return keys.css;
    }
    return value;
}

export function findFigmaPropViaTokenLookup(
    value: string | undefined,
    tokenLookup?: CDefTokenLookup
) {
    const keys = _findKeysViaTokenLookup(value, tokenLookup);
    if (
        keys &&
        typeof keys === 'object' &&
        keys.figma
    ) {
        return keys.figma;
    }
    return value;
}

export function findFigmaCompositePropViaTokenLookup(
    value: string | undefined,
    tokenLookup?: CDefTokenLookup
) {
    const keys = _findKeysViaTokenLookup(value, tokenLookup);
    if (
        keys &&
        typeof keys === 'object' &&
        keys.figma
    ) {
        return keys.figmaComposite;
    }
    return value;
}

function _findKeysViaTokenLookup(
    value: string | undefined,
    tokenLookup?: CDefTokenLookup
): CDefTokenLookupKeys | undefined {
    if (tokenLookup && value && typeof value === 'string') {
        const index = tokenLookup.lookup[value.replace(/ /g, '')];
        if (index) {
            const lookup = tokenLookup.tokens[index];
            if (lookup) {
                return lookup;
            }
        }
    }
}