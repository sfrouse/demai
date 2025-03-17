import getDefaultValue from "./getDefaultValue.mjs";
import getKindStr from "./getKindStr.mjs";

export default function processEnum(
    property
) {
    const propertyType = property.getType();
    if (propertyType.isEnum()) {
        const options = {};
        const enumValues = [];
        property.getChildren().map(child => {
            const kindStr = getKindStr(child);
            if (kindStr === 'TypeReference') {
                const declarations = child.getType().getAliasSymbol().getDeclarations();
                const exports = child.getType().getAliasSymbol().getExports();
                exports.map(exp => {
                    const declarations = exp.getDeclarations();
                    declarations.map(declaration => {
                        let name = declaration.getName();
                        if (name) name = name.replace(/_/g, ' ');
                        const value = getDefaultValue(declaration);
                        enumValues.push(value);
                        options[name] = value;
                    })
                })
            }
        });
        return {
            options, enumValues
        }
    }
    return null;
}

function getTypeStr(type) {
    if (type.isAnonymous()) return 'anonymous';
    if (type.isAny()) return 'any';
    if (type.isArray()) return 'array';
    if (type.isBoolean()) return 'boolean';
    if (type.isBooleanLiteral()) return 'boolean literal';
    if (type.isClass()) return 'class';
    if (type.isClassOrInterface()) return 'class or interface';
    if (type.isEnum()) return 'enum';
    if (type.isEnumLiteral()) return 'enum literal';
    if (type.isInterface()) return 'interface';
    if (type.isIntersection()) return 'intersection';
    if (type.isLiteral()) return 'literal';
    if (type.isNull()) return 'null';
    if (type.isNumber()) return 'number';
    if (type.isNumberLiteral()) return 'number literal';
    if (type.isObject()) return 'object';
    if (type.isString()) return 'string';
    if (type.isStringLiteral()) return 'string literal';
    if (type.isTemplateLiteral()) return 'template literal';
    if (type.isTuple()) return 'tuple';
    if (type.isUndefined()) return 'undefined';
    if (type.isUnion()) return 'union';
    if (type.isUnionOrIntersection()) return 'union or intersection';
    if (type.isUnknown()) return 'unknown';
    return 'other';
}