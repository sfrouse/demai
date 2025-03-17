import { CDefDefinition } from "../../types";

// const classLookup: {[key:string]: any} = {};

export default function findOrCreateDefinition(cls: any): CDefDefinition {
  // if (!classLookup[cls.name]) {
  if (!cls.componentDefinition) {
    const compDefinition: CDefDefinition = {
      $schema: 'https://json-schema.org/draft-07/schema',
      $id: '',
      type: "object",
      additionalProperties: false,
      properties: {
        "$schema": {type: "string"},
        "$identifier" : {type: ["string", "object"]},
      },
      "x-cdef": {
        tag: ''
      }
    };
    cls.componentDefinition = compDefinition;
    // classLookup[cls.name] = compDefinition;
  }
  const definition: CDefDefinition = cls.componentDefinition;
  // const definition: CDefDefinition = classLookup[cls.name];

  // enforce some defaults
  if (!definition['x-cdef']) definition['x-cdef'] = {tag: ''};
  if (!definition.properties) definition.properties = {"$schema": {type: "string"}};

  return definition;
}