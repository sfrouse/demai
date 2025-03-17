import { CDEF_DEFINTION_EXTENSTION, CDEF_INSTANCE_EXTENSTION } from "../../constants";

export default function stringToCDefId(
    str: string,
    isInstance: boolean = false
): string {
    const ext = isInstance ? CDEF_INSTANCE_EXTENSTION : CDEF_DEFINTION_EXTENSTION;
    const index = str.indexOf(ext);
    if (index > -1 && index === (str.length - ext.length)) {
        return str;
    }
    return `${str}${ext}`;
}