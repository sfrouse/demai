
import { CDefDefinitionType } from "../../types";
import { DefineArgs } from "../define";


export default function padTypeIfContent(
    type: CDefDefinitionType,
    args?: DefineArgs
  ): CDefDefinitionType {
    if (args?.content === true) {
      if (Array.isArray(type)) {
        const newTypeArr = [...type];
        if (!newTypeArr.includes('object')) {
          newTypeArr.push('object');
        }
        if (!newTypeArr.includes('array')) {
          newTypeArr.push('array');
        } 
        return newTypeArr;    
      }else{
        if (type) {
          return [type, 'object', 'array'];
        }else{
          return ['string', 'object', 'array'];
        }
      }
    }
    return type;
  }