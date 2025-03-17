import { CDEF_DEFINTION_EXTENSTION, CDEF_INSTANCE_EXTENSTION } from "../../constants";

export default function cDefToString(
    str: string | undefined
): string {
    if (!str) return '';
    if (str.indexOf(CDEF_INSTANCE_EXTENSTION) === (str.length - CDEF_INSTANCE_EXTENSTION.length)) {
        return str.replace(CDEF_INSTANCE_EXTENSTION, '');
    }
    if (str.indexOf(CDEF_DEFINTION_EXTENSTION) === (str.length - CDEF_DEFINTION_EXTENSTION.length)) {
        return str.replace(CDEF_DEFINTION_EXTENSTION, '');
    }
    return str;
}