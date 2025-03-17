import {
    CDefDefinition,
    CDefInstance,
    CDefTokenLookup
} from '../../types.js';
import findFigmaSlots from '../../utils/findFigmaSlots.js';
import findDefinitionSlots from './processSlots/findDefinitionSlots.js';
import processSlot from './processSlots/processSlot.js';

export async function processSlots(
    compDefinition: CDefDefinition,
    figmaComponent: ComponentNode | undefined,
    figmaInstance: InstanceNode,
    cDefRootUrl: string,
    defInstance: CDefInstance,
    isClone: boolean,
    tokenLookup: CDefTokenLookup | undefined,
    allVarsLookup: {[name:string]: {}[]}
) {
    if (!figmaComponent) return;

    if (compDefinition.properties) {
        // find what slots to expect
        const slotDefs = findDefinitionSlots(compDefinition);

        // map to figma slots...
        // this requires a specific instance (named after the property) of a 
        // component named "slots" with child instances of "slots-child"
        const instanceSlots = findFigmaSlots(figmaInstance);
        // const componentSlots = findFigmaSlots(figmaComponent);

        const entries = Object.entries(slotDefs);
        for (const [slotName, slotDef] of entries) {
            await processSlot(
                slotName,
                instanceSlots,
                cDefRootUrl,
                slotDef,
                defInstance,
                isClone,
                tokenLookup,
                allVarsLookup
            );
        }
    }
}




