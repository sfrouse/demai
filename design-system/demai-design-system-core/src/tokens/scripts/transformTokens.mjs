// import { contentfulJavascriptRender, contentfulTypescriptRender } from './contentful/contentfulRender.mjs';
// import typescriptRender from './typescript/typescriptRender.mjs';
// import cssRender from './css/cssRender.mjs';
// import scssRender from './scss/scssRender.mjs';
// import tokenValuesToCssProps from './utils/tokenValuesToCssProps.mjs';
// import typescriptPrimitiveRender from './typescript/typescriptPrimitivesRender.mjs';
// import createTokensByMode from './utils/createTokensByMode.mjs';
import hydrateTokens from './orbital/hydrateTokens.mjs';
import semanticTokens from './orbital/semanticTokens.mjs';
import tokenLookup from './orbital/tokenLookup.mjs';
import hydratedToContentfulTokens from './orbital/hydratedToContentfulTokens.mjs';
import flatTokensToNested from './orbital/flatTokensToNested.mjs';

export default async function transformTokens(
    tokens,
    prefix,
    dest
) {
    const writeFileArr = [];  

    // =========== BUILD =============
    // TODO: hook up to ai
    // const fontsUrl = 'https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,100..900;1,100..900&display=swap';
    // const fontsUrl = 'https://fonts.googleapis.com/css2?family=Prompt:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap';
    const fontsUrl = '';
    const hydrateTokensResult = await hydrateTokens(tokens, prefix);
    const tokenLookupResults = tokenLookup(hydrateTokensResult);
    const contentfulTokensResults = hydratedToContentfulTokens(hydrateTokensResult, prefix);

    // =========== RENDER =============
    writeFileArr.push({
        name: 'hydratedTokens',
        path: `${dest}/json/hydratedTokens.json`,
        content: `${JSON.stringify(hydrateTokensResult, null, 2)}`
    });

    writeFileArr.push({
        name: 'hydratedLookup',
        path: `${dest}/json/tokensLookup.json`,
        content: `${JSON.stringify(tokenLookupResults.lookup, null, 2)}`
    });

     writeFileArr.push({
        name: 'json',
        path: `${dest}/json/tokens.json`,
        content: `{\n\t${tokenLookupResults.json.join(',\n\t')}\n}`
    });

    const nestedTokens = flatTokensToNested(JSON.parse(`{\n\t${tokenLookupResults.jsonPrimitive.join(',\n\t')}}`));
    writeFileArr.push({
        name: 'jsonNested',
        path: `${dest}/json/tokensNested.json`,
        content: `${JSON.stringify(nestedTokens, null, 2)}`
    });

    const semantic = semanticTokens(hydrateTokensResult, prefix);
    writeFileArr.push({
        name: 'semanticTokens',
        path: `${dest}/typescript/semantic.ts`,
        content: `const semantic = ${JSON.stringify(semantic, null, 2)};\nexport default semantic;`
    });

    writeFileArr.push({
        name: 'css',
        path: `${dest}/css/tokens.css`,
        content: `@import url('${fontsUrl}');\n\n:root, .light {\n\t${tokenLookupResults.css.join('\n\t')}\n}`
    });

    writeFileArr.push({
        name: 'ai',
        path: `${dest}/ai/tokens.ai.txt`,
        content: tokenLookupResults.ai.join(' ')
    });

    writeFileArr.push({
        name: 'scss',
        path: `${dest}/scss/tokens.scss`,
        content: `${tokenLookupResults.scss.join('\n')}`
    });

    writeFileArr.push({
        name: 'javascript',
        path: `${dest}/javascript/tokens.js`,
        content: `const design = {\n\t${tokenLookupResults.js.join(',\n\t')}\n};\nexport default design;`
    });

    writeFileArr.push({
        name: 'optionsJavascript',
        path: `${dest}/javascript/tokenOptions.js`,
        content: `const designOptions = {\n\t${tokenLookupResults.jsOptions.join(',\n\t')}\n};\nexport default designOptions;`
    });

    writeFileArr.push({
        name: 'figma',
        path: `${dest}/figma/tokens.fig.txt`,
        content: `${tokenLookupResults.figma.join('\n')}`
    });

    writeFileArr.push({
        name: 'contentful',
        path: `${dest}/contentful/contentfulTokens.js`,
        content: `const tokens = ${JSON.stringify(contentfulTokensResults, null, 2)};\nexport default tokens;`
    });

    return writeFileArr;
}
