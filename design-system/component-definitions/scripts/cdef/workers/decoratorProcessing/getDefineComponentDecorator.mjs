import convertToObj from "./utils/convertToObj.mjs";
import stripStr from "./utils/stripStr.mjs";

export default function getDefineComponentDecorator(cls) {
    const modifiers = cls.getModifiers();
    const decorator = modifiers.find(modifier => {
        if (modifier.getKindName() === 'Decorator') {
            if (modifier.getName() === 'defineComponent') {
                return true;
            }
        }
        return false;
    });

    let decoratorResults = {
        name: undefined,
        examples: [],
        figmaComponent: undefined,
        hiddenProperties: [],
        designProperties: [],
        slots: [],
        import: undefined,
        contentful: { builtInStyles: [] }
    }

    if (!decorator) return decoratorResults;

    const decoratorExpression = decorator.getExpression();
    const args = decoratorExpression.getArguments();

    let name = cls.getName();
    let compArgs = {};
    if (args[0]) {
        name = stripStr(args[0].getText());
    }
    if (args[1]) {
        compArgs = convertToObj(args[1]);
    }

    // console.log('compArgs', compArgs);
    decoratorResults = {
        ...decoratorResults,
        name,
        ...compArgs
    }

    return decoratorResults;
}

