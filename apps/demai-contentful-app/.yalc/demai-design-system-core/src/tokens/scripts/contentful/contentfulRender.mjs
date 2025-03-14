
export function contentfulTypescriptRender(
    dest, writeFileArr, contentfulTokens
) {
    const ctflDir = `${dest}/contentful`;
    writeFileArr.push({
        name: 'contentfulTypescript',
        path: `${ctflDir}/tokens.ts`,
        content: `import { DesignTokensDefinition } from "@contentful/experiences-core/dist/types";

const tokens: DesignTokensDefinition = ${JSON.stringify(contentfulTokens, null, 2)};\nexport default tokens;`
    });
}

export function contentfulJavascriptRender(
    dest, writeFileArr, contentfulTokens
) {
    const ctflDir = `${dest}/contentful`;
    writeFileArr.push({
        name: 'contentfulJavascript',
        path: `${ctflDir}/tokens.js`,
        content: `const tokens = ${JSON.stringify(contentfulTokens, null, 2)};\nexport default tokens;`
    });
}