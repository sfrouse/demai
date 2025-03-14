// import fs from 'fs';
import tsToTypeScriptReferences from './tokensToTypeScriptReferences.mjs';

export default function typescriptPrimitiveRender(
    dest, writeFileArr, primitiveTokens, prefix
) {
    const tsDir = `${dest}/ts`;
    // if (!fs.existsSync(tsDir)){
    //     fs.mkdirSync(tsDir, { recursive: true });
    // }
    // const tsReferences = tsToTypeScriptReferences( primitiveTokens, prefix, undefined, undefined, undefined, true );
    // writeFileArr.push(fs.promises.writeFile(
    //     `${tsDir}/tokens-primitives.ts`,
    //     `const tokens = ${JSON.stringify(tsReferences, null, 2)};\nexport default tokens;`
    // ));

    const tsReferences = tsToTypeScriptReferences( primitiveTokens, prefix, undefined, undefined, undefined, true );
    writeFileArr.push({
        name: 'tokensPrimitivesTypescript',
        path: `${tsDir}/tokens-primitives.ts`,
        content: `const tokens = ${JSON.stringify(tsReferences, null, 2)};\nexport default tokens;`
    });
}