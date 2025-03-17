

export default function tokenLookup(hydratedTokens) {
    const result = {
        css: [],
        ai: [],
        scss: [],
        js: [],
        json: [],
        jsonPrimitive: [],
        jsOptions: [],
        figma: [],
        // semantic: [],
        lookup: {
            tokens: [],
            lookup: {}
        }
    }

    Object.values(hydratedTokens).map(token => {
        Object.values(token.keys).map(keyValue => {
           result.lookup.lookup[keyValue] = result.lookup.tokens.length;
        });
        result.lookup.tokens.push({
            ...token.keys
        });

        result.ai.push(
            token.keys.css
                .replace(/var\(|\)/g, '')
                .replace(/--wc-/g, '')
        );

        Object.entries(token.outputs).map((entry, index) => {
            // const name = entry[0];
            if (
                // name === 'default' ||
                // name === 'light' ||
                // name === 'desktop'
                index === 0 // can't depend on this necessarily...
            ) {
                const output = entry[1];
                result.css.push(output.css);
                result.scss.push(output.scss);
                result.js.push(output.js);
                result.json.push(output.json);
                result.jsonPrimitive.push(output.jsonPrimitive);
                result.jsOptions.push(output.option);
                result.figma.push(output.figma);
                // if (output.semantic) {
                //     output.semantic.push(output.semantic);
                // }
            }
        })
    });

    return result;

}