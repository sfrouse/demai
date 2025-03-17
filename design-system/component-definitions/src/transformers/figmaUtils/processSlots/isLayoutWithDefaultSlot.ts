import { CDefDefinition } from "../../../types";

export function hasLayoutDefinition(
    compDefinition: CDefDefinition
) {
    let isLayout = false;
    if (compDefinition.properties) {
        Object.values(compDefinition.properties).find((prop: CDefDefinition) => {
            if (prop['x-cdef']?.design === true) {
                isLayout = true;
                return true;
            }
            return false
        });
    }
    return isLayout;
}

export function isDefaultSlotDefinition(
    compDefinition: CDefDefinition
) {
    let hasDefaultSlot = false;
    if (compDefinition.properties) {
        Object.values(compDefinition.properties).find((prop: CDefDefinition) => {
            if (
                prop['x-cdef']?.output?.webComponent?.slot === true &&
                prop['x-cdef']?.output?.webComponent?.defaultSlot === true
            ) {
                hasDefaultSlot = true;
                return true;
            }
            return false
        });
    }
    return hasDefaultSlot;
}