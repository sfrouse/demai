import { CDEF_INSTRINSIC_IDS } from "../../constants";
import { CDefDefinition } from "../../types";

export default function propertyHasOneExternalRef(
    property: CDefDefinition
) : boolean {
    let ref = property.$ref;
    if (
        !ref &&
        property.items &&
        property.items !== true ) {
        if (Array.isArray(property.items)) {
            const oneExternalRef = property.items.find((item : any) => {
                return propertyHasOneExternalRef(item as CDefDefinition);
            });
            return oneExternalRef ? true : false;
        }else{
            ref = property.items.$ref;
        }
    }

    if (ref === undefined) {
        return false;
    }
    if (CDEF_INSTRINSIC_IDS.includes(ref)) {
        return false;
    }
    return true;
}