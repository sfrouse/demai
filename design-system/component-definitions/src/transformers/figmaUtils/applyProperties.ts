import { CDefInstance } from "../../types";
import findExposedChildren from "../../utils/findExposedChildren";

export function applyProperties(
    figmaInstance: InstanceNode,
    defInstance: CDefInstance,
    compPropDefs: any
) {
    // Map values to Figma Comp properties
    const newProps: {[key:string]: string} = {};
    Object.keys(figmaInstance.componentProperties).map(name => {
        processComponentProperty(
            name,
            defInstance,
            compPropDefs,
            newProps
        );
    });

    // Look for properties within exposed children
    // (exposed == "Exposed properties from nested children")
    const exposedChildren = findExposedChildren(figmaInstance);
    exposedChildren.map((child: {
        componentProperties: {};
        setProperties: (arg0: { [key: string]: string; }) => void;
    }) => {
        const newChildProps: {[key:string]: string} = {};
        Object.keys(child.componentProperties).map(name => {
            processComponentProperty(
                name,
                defInstance,
                compPropDefs,
                newChildProps
            );
        });
        child.setProperties(newChildProps);
    });

    // Save Contentful Info in Plugin Data
    if (defInstance.$identifier) {
        figmaInstance.setPluginData(
            'contentfulIdentifier',
            (defInstance.$identifier as any).contentful
        );
    }

    try {
        figmaInstance.setProperties(newProps);
    }catch(err) {
        console.error(`[applyProperties]`, newProps, err)
    }
    
}

function processComponentProperty(
    name: string,
    defInstance: CDefInstance,
    compPropDefs: any,
    newProps: {[key:string]: string}
) {
    try {
        let finalNameArr = name.split('#');
        finalNameArr.length > 1 ? finalNameArr.pop() : null;
        const finalName = finalNameArr.join('');
        const defInstanceValue = defInstance[finalName];
        if (defInstanceValue !== undefined) {
            const compProp = compPropDefs[finalName];
            const value = `${defInstanceValue}`;
            if (compProp && compProp.type === 'VARIANT') {
                if (
                    compProp.variantOptions &&
                    compProp.type === 'VARIANT' &&
                    compProp.variantOptions.includes(value)
                ) {
                    newProps[name] = `${defInstanceValue}`;
                }else{
                    console.warn(`[processComponentProperty] Variation not found in Figma component ${finalName}`);
                    // figma.notify(`Variation not found in Figma component ${finalName}`, {error: true})
                }
            }else{
                newProps[name] = `${defInstanceValue}`;
            }
        }else{
            console.warn(`[processComponentProperty] did not find defInstance for "${finalName}"`)
        }
    }catch(err) {
        console.error(`[processComponentProperty] ERROR`, err);
    }
}