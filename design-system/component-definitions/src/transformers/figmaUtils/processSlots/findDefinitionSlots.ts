import { CDefDefinition } from "../../../types";

export default function findDefinitionSlots(
    compDefinition: CDefDefinition
): {[key:string]: CDefDefinition} {
    const slotDefs: {[key:string]: CDefDefinition} = {};
    if (compDefinition.properties) {
        Object.entries(compDefinition.properties).map((entry) => {
            const name: string = entry[0];
            const prop: CDefDefinition = entry[1];
            if (prop['x-cdef']?.output?.webComponent?.slot === true) {
                slotDefs[name] = prop;
            }
        });
    }
    return slotDefs;
}