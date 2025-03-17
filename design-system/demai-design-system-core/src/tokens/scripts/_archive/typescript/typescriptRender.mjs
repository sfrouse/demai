// import fs from 'fs';
import tsToTypeScriptReferences from './tokensToTypeScriptReferences.mjs';

export default function typescriptRender(
    dest, writeFileArr, defaultTokensWithCssProps, prefix
) {
    const tsDir = `${dest}/ts`;
    // if (!fs.existsSync(tsDir)){
    //     fs.mkdirSync(tsDir, { recursive: true });
    // }
    // const tsReferences = tsToTypeScriptReferences( defaultTokensWithCssProps, prefix );
    // writeFileArr.push(fs.promises.writeFile(
    //     `${tsDir}/tokens.ts`,
    //     `const tokens = ${JSON.stringify(tsReferences, null, 2)};\nexport default tokens;`
    // ));

    const tsReferences = tsToTypeScriptReferences( defaultTokensWithCssProps, prefix );
    writeFileArr.push({
        name: 'tokensTypescript',
        path: `${tsDir}/tokens.ts`,
        content: `const tokens = ${JSON.stringify(tsReferences, null, 2)};\nexport default tokens;`
    });
}