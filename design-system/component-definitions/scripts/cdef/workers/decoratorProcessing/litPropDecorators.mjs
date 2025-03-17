import getKindStr from "../getKindStr.mjs";


export default function litPropDecorators(
    property
) {
    const modifiers = property.getModifiers();
    const output = {
        attribute: null
    }
    modifiers.map(modifier => {
        const callExp = modifier.getExpression();// callExpression
        if (getKindStr(callExp) === 'CallExpression') {
            const identifier = callExp.getExpression();
            if (identifier) {
                if (identifier.getText() === 'property') { // the lit decorator
                    const args = callExp.getArguments();
                    args.map(arg => {
                        const props = arg.getProperties();
                        props.map(prop => {
                            if (prop.getName() === 'attribute') {
                                const initValueObj = prop.getInitializer();
                                if (initValueObj) {
                                    const value = initValueObj.getText();
                                    output.attribute = value;
                                }
                            }
                        });
                    });
                }
            }
        }
    });
    return output;
}