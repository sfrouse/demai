import getComponentDefinition from "../transformers/utils/getComponentDefinition";
import { 
    CDefLintError,
    CDefLintErrorCode,
    CDefLintErrorTarget,
    CDefLintPropertyResult,
    CDefLintResult
} from "../types";
import findFigmaSlots from "../utils/findFigmaSlots";
import findExposedChildren from "../utils/findExposedChildren";
import lintBoolean from "./utils/lintBoolean";
import lintEnum from "./utils/lintEnum";
import lintObject from "./utils/lintObject";
import lintString from "./utils/lintString";
import tallyErrorsForResults from "./utils/tallErrorsForResults";

export default async function lintFigmaComponent(
    figmaCompArg: any, // COMPONENT or COMPONENT_SET having trouble import Figma types
    cDefRootUrl: string,
    figma: any // Figma API
): Promise<CDefLintResult | void> {

    if (!figmaCompArg) {
        console.log("no figma comp");
        return;
    }

    let figmaComp = figmaCompArg;
    if (
        figmaCompArg?.type === 'COMPONENT' &&
        figmaCompArg?.parent?.type === 'COMPONENT_SET'
    ) {
        figmaComp = figmaCompArg.parent;
    }

    const compDefinition = await getComponentDefinition(cDefRootUrl, figmaComp.name);
    if (!compDefinition) {
        console.error(`Component Definition not found`, cDefRootUrl, figmaComp.name);
        return;
    }

    const compSlots = findFigmaSlots(figmaComp);

    const lintResults: CDefLintResult = {
        id: figmaComp.name,
        properties: [],
        errors: [],
        totalErrors: 0,
        valid: true,
    }

    // clean up comp prop definitions
    const figmaCompPropertyDefinitions: any = {};
    if (figmaComp && figmaComp.componentPropertyDefinitions) {
        const processPropDef = (propName: string, propDef: any) => {
            let propNameArr = propName.split('#');
            propNameArr.length > 1 ? propNameArr.pop() : null;
            const finalName = propNameArr.join('#');
            // prioritize top level props...
            if (!figmaCompPropertyDefinitions[finalName]) {
                figmaCompPropertyDefinitions[finalName] = propDef;
            }
        }
        Object.entries(figmaComp.componentPropertyDefinitions).map(entry => {
            processPropDef(entry[0], entry[1]);
        });
        // now check children for exposure...
        // TODO: think about collisions...children can have the same name...
        const exposedChildren = findExposedChildren(figmaComp);
        exposedChildren.map(child => {
            let comp = child.mainComponent;
            if (comp?.parent?.type === 'COMPONENT_SET') {
                comp = comp.parent;
            }
            if (comp && comp.componentPropertyDefinitions) {
                Object.entries(comp.componentPropertyDefinitions).map(entry => {
                    processPropDef(entry[0], entry[1]);
                });
            }
        });
    }

    // walk through all comp props
    if (!compDefinition.properties) return;
    await Promise.all(   
        Object.entries(compDefinition.properties).map(defPropInfo => {
            return (async () => {
                const defName = defPropInfo[0];
                const defProp = defPropInfo[1];

                // can ignore special defNames
                if (defName === '$schema') return;
                if (defName === '$identifier') return;

                // look for the equvilant in figma...
                let figmaProp;
                if (figmaCompPropertyDefinitions) {
                    figmaProp = figmaCompPropertyDefinitions[defName];
                }
                
                let propErrors: CDefLintError[] = [];
                if (
                    defProp["x-cdef"] &&
                    defProp["x-cdef"].output?.webComponent?.slot === true
                ) {
                    const slot = compSlots[defName];
                    if (!slot) {
                        propErrors.push({
                            errorCode: CDefLintErrorCode.MissingSlot,
                            target: CDefLintErrorTarget.Design,
                            message: 'Figma slot no found (instance named after slot property and an instance of a comp names "_slot")' 
                        });
                    }
                }else if (
                    defProp["x-cdef"] &&
                    ['layout', 'box-design'].includes(`${defProp["x-cdef"].input?.inputType}`)
                ) {
                    // It's alright...
                }else if (
                    defProp["x-cdef"] &&
                    defProp["x-cdef"].hidden !== true
                ) {// just ignore any errors if hidden prop
                    if (figmaProp) {
                        if (defProp.enum) { // needs to be first
                            lintEnum(defProp, figmaProp, propErrors);
                        }else if (defProp.type === 'boolean') {
                            lintBoolean(figmaProp, propErrors);
                        }else if (defProp.type === 'string') {
                            lintString(figmaProp, propErrors);
                        }else if (defProp.type === 'object') {
                            await lintObject(defProp, figmaProp, propErrors, figma);
                        }else if (defProp.type === 'array') {
                            // the only thing that really makes sense is looking up objects...
                            const objItem = defProp.items;
                            if (
                                objItem !== false && 
                                objItem !== true &&
                                !Array.isArray(objItem) &&
                                objItem?.type === 'object'
                            ) {
                                await lintObject(objItem, figmaProp, propErrors, figma);
                            }
                        }
                    }else{
                        let message = `Figma variant missing.`;
                        if (defProp.enum) {
                            message = `Figma enum variant missing (options: ${defProp.enum.join(', ')})`;
                        }
                        propErrors.push({
                            errorCode: CDefLintErrorCode.MissingProperty,
                            target: CDefLintErrorTarget.Design,
                            message 
                        });
                    }
                }

                const propResult: CDefLintPropertyResult = {
                    name: defName,
                    valid: propErrors.length > 0 ? false : true,
                    errors: propErrors,
                    property: defProp
                }
                lintResults.properties.push(propResult);
            })();
        })
    );

    // Walk through Figma props...
    Object.keys(figmaCompPropertyDefinitions).map(figmaName => {
        if (!compDefinition.properties) return;
        if (!compDefinition.properties[figmaName]) {
            // TODO: check type and write various types of code...
            const propResult: CDefLintPropertyResult = {
                name: figmaName,
                valid: false,
                errors: [{
                    errorCode: CDefLintErrorCode.MissingProperty,
                    target: CDefLintErrorTarget.Definition,
                    message: `Component Definition property missing.`,
                    code: {
                        web: `@defineHidden('${figmaName}')\n\t${figmaName}: string;`
                    }
                }]
            }
            lintResults.properties.push(propResult);
        }
    });
    tallyErrorsForResults(lintResults);

    // sort
    lintResults.properties = [...lintResults.properties].sort((a: any, b: any) => a.name.localeCompare(b.name));
    return lintResults;
}



