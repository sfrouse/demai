import convertToObj from "./utils/convertToObj.mjs";
import stripStr from "./utils/stripStr.mjs";

export default function getDefineDecorator(property) {
    const modifiers = property.getModifiers();
    const decorator = modifiers.find(modifier => {
        if (modifier.getKindName() === 'Decorator') {
            if (modifier.getName() === 'define') {
                return true;
            }
        }
        return false;
    });

    let decoratorResults = {
        label: undefined,
        description: undefined,
        content: undefined,
        max: undefined,
        min: undefined,
    }

    if (!decorator) return decoratorResults;

    const decoratorExpression = decorator.getExpression();
    const args = decoratorExpression.getArguments();

    let label = property.getName();
    let compArgs = {};
    if (args[0]) {
        label = stripStr(args[0].getText());
    }
    if (args[1]) {
        compArgs = convertToObj(args[1]);
    }

    decoratorResults = {
        ...decoratorResults,
        label,
        ...compArgs
    }

    return decoratorResults;
}