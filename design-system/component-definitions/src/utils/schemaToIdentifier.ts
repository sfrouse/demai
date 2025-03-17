import { CDEF_DEFINTION_EXTENSTION, CDEF_INSTANCE_EXTENSTION } from "../constants";

// TODO: change to figma comp reference...
export default function schemaToIdentifier(schema: string) {
    return schema ? schema.replace(CDEF_INSTANCE_EXTENSTION, '').replace(CDEF_DEFINTION_EXTENSTION, '') : '';
}