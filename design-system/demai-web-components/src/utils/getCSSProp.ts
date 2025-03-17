
import tokensLookup from '../../dist/tokens/tokensLookup.json' assert { type: 'json' };

export default function getCSSProp(tokenKey: string | null | undefined) {
    if (!tokenKey) return undefined;

    const lookupIndex = (tokensLookup as any).lookup[tokenKey];
    if (lookupIndex === undefined) return tokenKey;// it's a raw value

    const token = tokensLookup.tokens[lookupIndex];
    if (token === undefined) return tokenKey;// it's a raw value

    return token.css;
}

export function getCSSDeclaration(
    property: string | undefined,
    tokenKey: string | null | undefined,
    defaultValue?: string | null | undefined
): string {
    if (!tokenKey && !property) return '';

    const value = getCSSProp(tokenKey);
    if (!value) {
        if (defaultValue) return `${property}: ${defaultValue};`;
        return '';
    }

    return `${property}: ${value};`;
}

export function getCSSDeclarations(
    declarations: {[key: string]: string | undefined | null | [string | undefined | null, string | undefined | null]} = {}
): string {
    const result = Object.entries(declarations).map(declaration => {
        if (Array.isArray(declaration[1])) {
            return getCSSDeclaration(
                declaration[0],
                declaration[1][0],
                declaration[1][1]
            );
        }
        return getCSSDeclaration(
            declaration[0],
            declaration[1]
        );
    });

    return result.join('\n');
}