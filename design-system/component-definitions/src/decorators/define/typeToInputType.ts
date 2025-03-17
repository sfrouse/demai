import { CDefDefinition, CDefDefinitionInputType } from "../../types";

export default function typeToInputType(
    property: CDefDefinition,
    // optionValues?: string[]
  ): CDefDefinitionInputType {
    if (property?.enum !== undefined) return 'select';
    switch(property.type) {
      case 'string':
      case 'null':
        return 'string';
      case 'number':
      case 'integer':
        // TODO: check for max/min, then it's a slider...
        if (
          property.maximum !== undefined &&
          property.minimum !== undefined) {
            return 'slider';
        }
        return 'number';
      case 'boolean':
        return 'boolean';
      case 'array':
      case 'object':
      default:
        return 'unknown';
    }
  }