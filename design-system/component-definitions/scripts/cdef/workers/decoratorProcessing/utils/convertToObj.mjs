import stripStr from "./stripStr.mjs";


export default function convertToObj(expression) {
    const kindName = expression.getKindName();
    if (kindName === "ObjectLiteralExpression") {
        const properties = expression.getProperties();
        const result = {};
        
        properties.forEach(prop => {
            if (prop.getKindName() === "PropertyAssignment") {
                const key = stripStr( prop.getName() );
                const initializer = prop.getInitializer();
                result[key] = convertToObj(initializer); // Recursively convert
            }
        });
        
        return result;
    } else if (kindName === "ArrayLiteralExpression") {
        return expression.getElements().map(element => convertToObj(element));
    } else if (kindName === "Identifier") {
        // an enum
        const symbol = expression.getSymbol();
        const results = {};
        if (symbol) {
            const exports = symbol.getExports() ;
            if (exports) {
                exports.map((exp) => {
                    const name = exp.getName();
                    const value = exp
                        .getValueDeclaration()
                        .getInitializer()
                        .getText();
                    results[name] = stripStr(value);
                });
            }
        }
        return results;
    } else if (kindName === "PropertyAccessExpression") {
        const symbol = expression.getSymbol();
        if (!symbol) {
            console.error(`no symbol for Property ${expression.getText()}, code malformed`);
            return;
        }
        const initializer = symbol
            .getDeclarations()[0]
            .getInitializer();

        return convertToObj(initializer);
    } else {
        // Return literal value or raw text (e.g., for strings)
        return eval(expression.getText());
    }
}