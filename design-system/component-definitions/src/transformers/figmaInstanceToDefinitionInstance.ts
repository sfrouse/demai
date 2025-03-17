import findExposedChildren from "../utils/findExposedChildren";
import { CDefDefinition, CDefInstance } from "../types";
import findInstanceOfProp from "./utils/findInstanceOfProp";
import getComponentDefinition from "./utils/getComponentDefinition";
// import { findLayoutPropertyName, getLayoutFromStorage } from "../utils/layoutStorage";
import { getAllVariablesLookupViaId } from "./figmaUtils/applyStyleProperties";
import { getComponentDefinitionTokenLookupIndexedToFigmaVariables } from "./utils/getComponentDefinitionTokenLookup";
import { CDefDesignProperty } from "../decorators/defineComponent";
import findSlotChildren, { processSlotChildren } from "./utils/findSlotChildren";
// Having trouble getting Figma types to work here...

export default async function figmaInstanceToDefinitionInstance(
    figmaNode: any | undefined,
    cDefPath: string,
    figma: any, // Figma API,
    allVarsLookupCached?: {[name: string]: {}[]},
    tokenLookupCached? : any,
    isRoot: boolean = true
): Promise<CDefInstance | undefined> {

    const allVarsLookup = allVarsLookupCached || await getAllVariablesLookupViaId(figma);
    const tokenLookup = tokenLookupCached || await getComponentDefinitionTokenLookupIndexedToFigmaVariables(cDefPath);

    // TODO: figure out auto-layout figmaNodes
    if (figmaNode.type === "INSTANCE") {
        const cdefInstance: any = {};
        const compName = getInstanceCompName(figmaNode);
        cdefInstance['$schema'] = `${compName}.cdef.json`;
        const compDefinition = await getComponentDefinition(
            cDefPath,
            cdefInstance['$schema'] as string
        );
        if (!compDefinition) {
            console.error(
                `Component Definition not found`,
                cDefPath,
                cdefInstance['$schema']
            );
            return;
        }

        // Identifier transfer
        const contentfulId = figmaNode.getPluginData('contentfulIdentifier');
        // something errors out if this isn't at least set
        cdefInstance['$identifier'] = {contentful: contentfulId};

        // Node Component Properties
        const promiseArr: Promise<any>[] = [];
        Object.entries(figmaNode.componentProperties).map(entry => {
            promiseArr.push((async() => {
                const propName = entry[0];
                const prop = entry[1] as any;
                return processProp(
                    propName,
                    prop,
                    compDefinition,
                    figmaNode,
                    cdefInstance,
                    cDefPath,
                    figma
                );
            })());
        });

        // Exposed Children
        const exposedChildren = findExposedChildren(figmaNode);
        exposedChildren.map(child => {
            Object.entries(child.componentProperties).map(entry => {
                promiseArr.push((async() => {
                    const propName = entry[0];
                    const prop = entry[1] as any;
                    return processProp(
                        propName,
                        prop,
                        compDefinition,
                        child,
                        cdefInstance,
                        cDefPath,
                        figma
                    );
                })());
            });
        });

        // Design Properties
        if (compDefinition.properties) {
            Object.entries(compDefinition.properties).map((entry: any) => {
                const propName = entry[0];
                const prop = entry[1];
                if (prop['x-cdef']?.design === true) {
                    switch (propName) {
                        case CDefDesignProperty.BACKGROUND_COLOR: {
                            if ( figmaNode.backgrounds?.length > 0) {
                                const background = figmaNode.backgrounds[0];
                                if (background.boundVariables?.color) {
                                    const variable = allVarsLookup[background.boundVariables.color.id] as any;
                                    const variableGlobalId = tokenLookup[`variable:${variable[0].name}`];
                                    cdefInstance[propName] = variableGlobalId;
                                }
                            }
                            break;
                        }
                        case CDefDesignProperty.TEXT_COLOR: {
                            const textNode = findFirstTextChild(figmaNode);
                            if (textNode) {
                                if ( textNode.boundVariables.fills?.length > 0) {
                                    const fill = textNode.boundVariables.fills[0];
                                    const variable = allVarsLookup[fill.id] as any;
                                    const variableGlobalId = tokenLookup[`variable:${variable[0].name}`];
                                    cdefInstance[propName] = variableGlobalId;
                                }
                            }
                            break;
                        }
                        case CDefDesignProperty.PADDING: {
                            // only one to one padding value right now...
                            if ( figmaNode.boundVariables?.paddingTop ) {
                                const variable = allVarsLookup[figmaNode.boundVariables.paddingTop.id] as any;
                                const variableGlobalId = tokenLookup[`variable:${variable[0].name}`];
                                cdefInstance[propName] = variableGlobalId;
                            }
                            break;
                        }
                        case CDefDesignProperty.CORNER_RADIUS: {
                            // only one right now
                            if ( figmaNode.boundVariables?.topLeftRadius ) {
                                const variable = allVarsLookup[figmaNode.boundVariables.topLeftRadius.id] as any;
                                const variableGlobalId = tokenLookup[`variable:${variable[0].name}`];
                                cdefInstance[propName] = variableGlobalId;
                            }
                            break;
                        }
                        case CDefDesignProperty.GAP: {
                            const slotChildren = findSlotChildren(figmaNode);
                            if (slotChildren) {
                                slotChildren.map(slotChild => {
                                    if (slotChild.boundVariables?.itemSpacing) {
                                        const variable = allVarsLookup[slotChild.boundVariables.itemSpacing.id] as any;
                                        const variableGlobalId = tokenLookup[`variable:${variable[0].name}`];
                                        cdefInstance[propName] = variableGlobalId;
                                    }
                                });
                            }
                            break;
                        }
                        case CDefDesignProperty.BORDER_COLOR: {
                            // only one right now
                            if ( figmaNode.boundVariables?.strokes?.length > 0) {
                                const stroke = figmaNode.boundVariables?.strokes[0];
                                const variable = allVarsLookup[stroke.id] as any;
                                const variableGlobalId = tokenLookup[`variable:${variable[0].name}`];
                                cdefInstance[propName] = variableGlobalId;
                            }
                            break;
                        }
                        case CDefDesignProperty.BORDER_WIDTH: {
                            // only one right now
                            if ( figmaNode.boundVariables?.strokeTopWeight ) {
                                const weight = figmaNode.boundVariables.strokeTopWeight;
                                const variable = allVarsLookup[weight.id] as any;
                                const variableGlobalId = tokenLookup[`variable:${variable[0].name}`];
                                cdefInstance[propName] = variableGlobalId;
                            }
                            break;
                        }
                        case CDefDesignProperty.BORDER_STYLE: {
                            // only one right now
                            if ( figmaNode.strokes?.length > 0) {
                                const stroke = figmaNode.strokes[0];
                                cdefInstance[propName] = stroke.type.toLowerCase();
                            }
                            break;
                        }
                        case CDefDesignProperty.LAYOUT_DIRECTION: {
                            const slotChildren = findSlotChildren(figmaNode);
                            if (slotChildren) {
                                slotChildren.map(slotChild => {
                                    cdefInstance[propName] =
                                        slotChild.layoutMode === "HORIZONTAL" ? "row" : "column"
                                });
                            }
                            break;
                        }
                        case CDefDesignProperty.FONT : {
                            // TODO
                            break;
                        }
                        case CDefDesignProperty.HORIZONTAL_RESIZING : {
                            // TODO: check against width of frame...that will tell if it is a fill instead...
                            if (isRoot) {
                                const fillFrameSize = (figmaNode.parent as FrameNode).width - 100;
                                if (fillFrameSize === figmaNode.width) {
                                    cdefInstance[propName] = 'fill';
                                }else{
                                    cdefInstance[propName] = figmaNode.layoutSizingHorizontal.toLowerCase();
                                }
                            }else{
                                cdefInstance[propName] = figmaNode.layoutSizingHorizontal.toLowerCase();
                            }
                            break;
                        }
                        case CDefDesignProperty.VERTICAL_RESIZING : {
                            cdefInstance[propName] = figmaNode.layoutSizingVertical.toLowerCase();
                            break;
                        }
                        case CDefDesignProperty.WIDTH : {
                            cdefInstance[propName] = `${figmaNode.width}px`;
                            break;
                        }
                        case CDefDesignProperty.HEIGHT : {
                            cdefInstance[propName] = `${figmaNode.height}px`;
                            break;
                        }
                        case CDefDesignProperty.ALIGN_ITEMS : {
                            processSlotChildren(figmaNode, (slot: any) => {
                                switch ( slot.counterAxisAlignItems ) {
                                    case 'MIN': {
                                        cdefInstance[propName] = `start`;
                                        break;
                                    }
                                    case 'CENTER': {
                                        cdefInstance[propName] = `center`;
                                        break;
                                    }
                                    case 'MAX': {
                                        cdefInstance[propName] = `end`;
                                        break;
                                    }
                                    case 'STRETCH': {
                                        cdefInstance[propName] = `stretch`;
                                        break;
                                    }
                                }
                            });
                            break;
                        }
                        case CDefDesignProperty.JUSTIFY_CONTENT : {
                            processSlotChildren(figmaNode, (slot: any) => {
                                switch ( slot.primaryAxisAlignItems ) {
                                    case 'MIN': {
                                        cdefInstance[propName] = `start`;
                                        break;
                                    }
                                    case 'CENTER': {
                                        cdefInstance[propName] = `center`;
                                        break;
                                    }
                                    case 'MAX': {
                                        cdefInstance[propName] = `end`;
                                        break;
                                    }
                                    case 'SPACE_BETWEEN': {
                                        cdefInstance[propName] = `space-between`;
                                        break;
                                    }
                                }
                            });
                            break;
                        }

                    }
                }
            });
        }

        await processSlotChildren(figmaNode, async (slot) => {
            const slotDefs: any[] = [];
            for (const slotChild of slot.children) {
                // Wait for each asynchronous operation to complete before proceeding to the next
                const slotChildDef = await figmaInstanceToDefinitionInstance(
                    slotChild, cDefPath, figma, allVarsLookup, tokenLookup
                );
                slotDefs.push(slotChildDef); // Push each result in order
            }
            cdefInstance[slot.name] = slotDefs;
        })
        
        await promiseArr;

        return cdefInstance;
    }
    return;
}

function getInstanceCompName(instance: any) {
    const comp = instance.mainComponent;
    const compParent = comp.parent;
    let name = instance.name;
    if (compParent?.type === "COMPONENT_SET") {
        name = compParent.name;
    }else{
        name = comp.name;
    }
    return name;
}

async function processProp(
    propName: string,
    prop: any,
    compDefinition: CDefDefinition,
    figmaNode: any,
    cdefInstance: any,
    cDefPath: string,
    figma: any
) {
    let propNameArr = propName.split('#');
    propNameArr.length > 1 ? propNameArr.pop() : null;
    const finalName = propNameArr.join('#');
    // we are not linting here...just take out.
    if (!compDefinition.properties || compDefinition.properties[finalName] === undefined) return;

    if (prop.type === "INSTANCE_SWAP") {
        const instances = findInstanceOfProp(figmaNode, propName);
        const cDef = compDefinition.properties[finalName];
        const swapDefInstances = await Promise.all(
            instances.map(inst => {
                return (async() => {
                    return await figmaInstanceToDefinitionInstance(inst, cDefPath, figma);
                })();
            })
        );
        if (cDef.type === 'array') {
            cdefInstance[finalName] = swapDefInstances;
        }else{
            cdefInstance[finalName] = swapDefInstances?.length > 0 ? swapDefInstances[0] : [];
        }
    }else{
        // text props always use " " as default...
        cdefInstance[finalName] = `${prop.value}`.trim();
    }
}

function findFirstTextChild(figmaNode: any) {
    let targetNode = figmaNode;
    if (targetNode.type !== 'TEXT') {
        targetNode = figmaNode.children.find((child: any) => child.type === 'TEXT');
    }
    return targetNode;
}