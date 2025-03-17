import getKindStr from "./getKindStr.mjs";

export default function getDefaultValue(
    property
) {
    const initilizer = property.getInitializer();// default
    if (!initilizer) return null;
    const kindStr = getKindStr(initilizer);
    switch (kindStr) {
        case 'StringLiteral' :
            return stripQuotes( initilizer.getText() );
        case 'TrueKeyword' :
            return true;
        case 'FalseKeyword' :
            return false;
        case 'PropertyAccessExpression' :
            const value = stripQuotes(
                initilizer
                    .getSymbol()
                    .getValueDeclaration()
                    .getInitializer()
                    .getText()
            );
            return value;
    }
    return null;
}

function stripQuotes(str) {
    return str.replace(/^["']|["']$/g, "");
}