// import { CDefDesignProperty } from "../decorators/defineComponent";
import { CDefDesignProperty } from "../decorators/defineComponent";
import {
    // CDefDefinition,
    CDefInstance,
    CDefLayout,
    // CDefTokenLookup,
    // CDefInstanceImage,
    // CDefInstanceRichText
} from "../types";
// import { findCSSViaTokenLookup } from "../utils/findViaTokenLookup";
import getComponentDefinition from "./utils/getComponentDefinition";
// import getComponentDefinitionTokenLookup from "./utils/getComponentDefinitionTokenLookup";
import isObject from "./utils/isObject";

// const DESIGN_PROPERTY_ATTR_PREFIX = 'data-cdef-';

export default async function definitionInstanceToWebInstance(
    definitionInst: CDefInstance | undefined,
    cDefPath: string,
    indent: number = 0,
    slotName?: string,
    parentLayout: CDefLayout = CDefLayout.NONE
): Promise<string | void> {

    if (!definitionInst) return;

    // const tokenLookup = await getComponentDefinitionTokenLookup(cDefPath);
    const compDefinition = await getComponentDefinition(
        cDefPath,
        definitionInst.$schema as string | undefined
    );
    if (!compDefinition) {
        console.error(`Component Definition not found`, cDefPath, definitionInst.$schema);
        return;
    }
    const tag = compDefinition["x-cdef"]?.tag;
    if (!tag) {
        console.error(`cdef did not have a tag`, cDefPath, compDefinition);
        return;
    }

    const tabs = `\t`.repeat(indent);
    const childTabs = `\t`.repeat(indent+1);
    const grandChildTabs = `\t`.repeat(indent+2);

    const attrs: string[] = [];
    // const styles: string[] = [];
    const slots: string[] = [];

    // styles.push(`--parent-layout: ${parentLayout};`);
    const layout = getLayout(definitionInst);;

    if (!compDefinition.properties) return;
    await Promise.all(
        Object.entries(compDefinition.properties).map(propertyInfo => {
            return (async() => {
                const name = propertyInfo[0];
                const property = propertyInfo[1];
                const value = definitionInst[name];

                if (name === "$schema") {
                    attrs.push(`data-schema="${value}"`)
                    return;
                }
                if (name === "$identifier") {
                    attrs.push(`data-entry-id="${(value as any)['contentful']}"`)
                    return;
                }
                
                const propXDef = property["x-cdef"];
                const webConfig = propXDef?.output?.webComponent;
                const attrName = webConfig?.attribute || name;
                const isSlot = webConfig?.slot === true;
                const slotName = isSlot ? name : undefined;
                const slotAttr = webConfig?.defaultSlot === true ? '' : ` slot="${slotName}"`;
                const designProp = propXDef?.design === true;
                
                if (value === undefined) return;
    
                // ARRAY
                if (Array.isArray(value)) {
                    const childArr: any[] = [];
                    for (const child of value) {
                        const childResult = await definitionInstanceToWebInstance(
                            child,
                            cDefPath,
                            indent + 2,
                            undefined,
                            layout
                        );
                        childArr.push(childResult); // Push each result sequentially
                    }
                    if (isSlot) {
                        if (webConfig?.defaultSlot === true) {
                            slots.push(`${childArr.join(`\n${childTabs}`)}`);
                        }else{
                            slots.push(`${
                                childTabs
                                }<div slot="${slotName}" data-desc="array">${
                                    `\n${grandChildTabs}`}${
                                        childArr.join(`\n${grandChildTabs}`)
                                    }${
                                    `\n${childTabs}`
                                }</div>`);
                        }
                    }else{
                        if (designProp) {
                            toAttr(attrs, attrName, childArr.join('\n'));
                        }else{
                            toAttr(attrs, attrName, childArr.join('\n'));
                        }
                    }

                // OBJECT
                }else if (isObject(value)) {
                    // it is a nested definition instance, possibly slot it
                    if ((value as CDefInstance).$schema !== undefined) {
                        const defValue = await definitionInstanceToWebInstance(
                            value as CDefInstance,
                            cDefPath,
                            indent+1,
                            slotName,
                            layout
                        );
                        if (isSlot) {
                            slots.push(`${childTabs}${defValue}`);
                        }else{
                            if (designProp) {
                            }else{
                                toAttr(attrs, attrName, defValue);
                            }
                        }
                    }else{
                        // it's a raw object of some sort...just stringify it.
                        if (isSlot) {
                            slots.push(`${
                                    childTabs
                                }<div${slotAttr} data-desc="raw object">${
                                    `\n${grandChildTabs}`}${
                                        JSON.stringify(value)
                                    }${
                                    `\n${childTabs}`
                                }</div>`);
                        }else{
                            if (designProp) {
                            }else{
                                toAttr(attrs, attrName, JSON.stringify(value, null, 2));
                            }
                        }
                    }
                }else{
                    if (isSlot) {
                        slots.push(`${
                            childTabs
                            }<div${slotAttr} data-type="string">${
                                `\n${grandChildTabs}`}${
                                    value
                                }${
                                `\n${childTabs}`
                            }</div>`);
                    }else{
                        // no need to add default nor hidden props
                        if (
                            propXDef?.hidden === true
                        ) {
                            return;
                        }
                        if (designProp) {
                            toAttr(attrs, attrName, value);
                        }else{
                            toAttr(attrs, attrName, value);
                        }
                    }
                }
            })();
        })
    );

    
    // no tab on starter tab...parent determines tabbing
    return `<${tag} ${
        slotName ? `slot="${slotName}" data-type="webcomp"` : ''
    } ${
        `\n${childTabs}${attrs.join(`\n${childTabs}`)}`
    }>${
        slots.length > 0 ? 
            `\n${slots.join(`\n`)}` : ''
    }\n${tabs}</${tag}>`;
}

function toAttr(attrs: string[], attr: string, value: any) {
    if (
        value !== 'false' &&
        value !== false &&
        value !== 'no' &&
        value !== undefined &&
        value !== null
    ) {
        if (value === true) {
            attrs.push(`${attr}`);
        }else{
            attrs.push(`${attr}="${String(value).replace(/"/g, "&quot;")}"`);
        }
    }
}

function getLayout(
    definitionInst: CDefInstance
): CDefLayout {
    const layoutDirection = definitionInst[CDefDesignProperty.LAYOUT_DIRECTION];
    if (layoutDirection) {
        if (layoutDirection === 'row') {
            return CDefLayout.ROW;
        }
        if (layoutDirection === 'column') {
            return CDefLayout.COLUMN;
        }
    }
    return CDefLayout.COLUMN;
}