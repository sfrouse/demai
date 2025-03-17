

export default function findFigmaSlots(
    figmaInstance: any,
    slots: {[key:string]: any} = {}
): {[key:string]: any} {
    if (figmaInstance.type === "INSTANCE") {
        const comp = figmaInstance.mainComponent;
        if (
            (
                comp?.parent?.type === "COMPONENT_SET" &&
                comp?.parent?.name === '_slot'
            ) ||
            (
                comp?.type === "COMPONENT" &&
                comp?.name === '_slot'
            )
        ) {
            if (figmaInstance.name === '_slot' || figmaInstance.name === 'default') {
                slots['default'] = figmaInstance;
            }else{
                slots[figmaInstance.name] = figmaInstance;
            }
        }
    }
    if (figmaInstance.children) {
        figmaInstance.children.map((child: any) => {
            findFigmaSlots(child, slots);
        });
    }
    return slots;
}