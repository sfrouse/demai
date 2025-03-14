import { contentfulJavascriptRender, contentfulTypescriptRender } from './contentful/contentfulRender.mjs';
import typescriptRender from './typescript/typescriptRender.mjs';
import cssRender from './css/cssRender.mjs';
import scssRender from './scss/scssRender.mjs';
import tokenValuesToCssProps from './utils/tokenValuesToCssProps.mjs';
import typescriptPrimitiveRender from './typescript/typescriptPrimitivesRender.mjs';
import createTokensByMode from './utils/createTokensByMode.mjs';

export default async function transformTokens(
    tokens,
    prefix,
    dest
) {
    const {
        remBase,
        tokensByMode,
        contentfulTokens,
        simpleTokensByMode
     } = createTokensByMode(tokens, prefix);

    const writeFileArr = [];

    // === CTFL TOKENS ===
    contentfulTypescriptRender(dest, writeFileArr, contentfulTokens);
    contentfulJavascriptRender(dest, writeFileArr, contentfulTokens);

    // === CSS ===========
    cssRender(dest, writeFileArr, tokensByMode, prefix, remBase);

    // ---------- CSS PROPS ONLY -----------------
    // The below only need to refer to their css props instead of actual values
    const defaultTokensWithCssProps = tokenValuesToCssProps(tokensByMode.default, prefix);

    // === TYPESCRIPT ====
    // typescriptRender(dest, writeFileArr, defaultTokensWithCssProps, prefix);
    typescriptRender(dest, writeFileArr, tokensByMode.default, prefix);
    typescriptPrimitiveRender(dest, writeFileArr, simpleTokensByMode.default, prefix );

    // === SCSS ==========
    scssRender(dest, writeFileArr, defaultTokensWithCssProps, prefix);

    // === TAILWIND ==========
    // tailwindRender(dest, writeFileArr, defaultTokensWithCssProps, prefix);

    // tokensByMode for reference
    writeFileArr.push({ // fs.promises.writeFile(
        name: 'tokensByMode',
        path: `${dest}/tokensByMode.json`,
        content: `${JSON.stringify(tokensByMode, null, 2)}`
    });

    writeFileArr.push({ // fs.promises.writeFile(
        name: 'tokensSource',
        path: `${dest}/tokens.source.ts`,
        content: `${typings}\n\nconst tokens: FigmaVariablesExport = ${JSON.stringify(tokens, null, 2)};\nexport default tokens;`
    });

    writeFileArr.push({ // fs.promises.writeFile(
        name: 'simpleTokensByMode',
        path: `${dest}/simpleTokensByMode.json`,
        content: `${JSON.stringify(simpleTokensByMode, null, 2)}`
    });
    return writeFileArr;
}


const typings = `
export type FigmaBaseExport = {
  name: string;
  id: string;
  figmaId?: string;
};

export type FigmaVariablesExport = FigmaBaseExport & {
  collections: FigmaCollectionExport[];
  styles: FigmaStyleExport[];
};

export type FigmaStyleExport = FigmaBaseExport & {
  type: "textStyle";
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
};

export type FigmaCollectionExport = FigmaBaseExport & {
  modes: FigmaModeExport[];
};

export type FigmaModeExport = FigmaBaseExport & {
  tokens: (
    | FigmaColorValueExport
    | FigmaAliasValueExport
    | FigmaDimensionValueExport
    | FigmaStringValueExport
    | FigmaIntValueExport
  )[];
};

export type FigmaColorValueExport = FigmaBaseExport & {
  type: "COLOR";
  value: { r: number; g: number; b: number; a: number };
};

export type FigmaDimensionValueExport = FigmaBaseExport & {
  type: "DIMENSION";
  value: number;
};

export type FigmaStringValueExport = FigmaBaseExport & {
  type: "STRING";
  value: string;
};

export type FigmaIntValueExport = FigmaBaseExport & {
  type: "INT";
  value: number;
};

export type FigmaAliasValueExport = FigmaBaseExport & {
  type: "ALIAS";
  value: {
    type: "VARIABLE_ALIAS";
    id: string;
    variableName: string;
    collectionName: string;
  };
};
`;