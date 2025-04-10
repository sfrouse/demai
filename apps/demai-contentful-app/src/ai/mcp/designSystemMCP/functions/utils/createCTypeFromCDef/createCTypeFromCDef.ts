import { KeyValueMap } from "@contentful/app-sdk/dist/types/entities";
import {
  ContentFields,
  ContentType,
  createClient,
} from "contentful-management";
import { kebabToCamel } from "../kebabTransforms";
import { DEMAI_SYSTEM_PROPERTY_IDENTIFIER } from "../../../../../../constants";

export default async function createCTypeFromCDef(
  cma: string,
  spaceId: string,
  environmentId: string,
  cdef: any
) {
  const client = createClient({ accessToken: cma });
  const space = await client.getSpace(spaceId);
  const environment = await space.getEnvironment(environmentId);

  const xDef = cdef?.["x-cdef"];
  if (!cdef || !xDef) {
    console.error("no cdef or xdef", cdef);
    return false;
  }

  const contentTypeId = xDef.tag;
  const name = xDef.tag; // xDef.name;
  const description = cdef.description;

  const cdefToCtypeType = (cDefType: string) => {
    switch (cDefType) {
      case "string": {
        return "Symbol"; // "Text" // TODO: figure out difference
      }
      case "boolean": {
        return "Boolean";
      }
      case "integer": {
        return "Integer";
      }
      case "number": {
        return "Integer";
      }
      case "object": {
        return "Object";
      }
      case "array": {
        return "Array";
      }
      default: {
        return "Symbol";
      }
    }
  };

  const fields: any = {};
  Object.entries(cdef.properties).map((entry) => {
    const key = entry[0] as string;
    const prop = entry[1] as any;
    if (key.indexOf("$") === 0) return;
    const safeKey = kebabToCamel(key);
    const type = cdefToCtypeType(prop.type);
    fields[safeKey] = {
      id: safeKey,
      name: prop.title,
      type,
      localized: false,
      required: false,
      validations: [],
      disabled: false,
      omitted: false,
    };
    if (prop.enum && prop.enum.length > 0) {
      fields[safeKey].validations = [
        {
          in: prop.enum,
        },
      ];
    }
    const propXCDef = prop["x-cdef"];
    if (propXCDef && propXCDef.input.defaultValue) {
      if (prop.enum && Array.isArray(prop.enum) && prop.enum.length > 0) {
        if (prop.enum.indexOf(propXCDef.input.defaultValue) !== -1) {
          fields[safeKey].defaultValue = {
            "en-US": propXCDef.input.defaultValue,
          };
        } else {
          console.error(
            "default value not in enum!!!",
            prop.enum,
            propXCDef.input.defaultValue
          );
          fields[safeKey].defaultValue = {
            "en-US": prop.enum[0],
          };
        }
      } else {
        if (type === "Boolean") {
          fields[safeKey].defaultValue = {
            "en-US":
              propXCDef.input.defaultValue === true ||
              propXCDef.input.defaultValue === "true"
                ? true
                : false,
          };
        } else {
          fields[safeKey].defaultValue = {
            "en-US": propXCDef.input.defaultValue,
          };
        }
      }
    }
    // TODO: array typings
    //   fields[key]["items"] = {
    //     type: "Symbol", // just string for now...
    //     validations: [
    //       {
    //         in: prop.enum,
    //       },
    //     ],
    //   };
  });
  let newCType: {
    name: string;
    description?: string;
    fields: ContentFields<KeyValueMap>[];
  } = {
    name: name || "Default Name",
    description,
    fields: Object.values(fields),
  };

  // add DemAI Identifier
  newCType.fields.push({
    id: DEMAI_SYSTEM_PROPERTY_IDENTIFIER,
    name: DEMAI_SYSTEM_PROPERTY_IDENTIFIER,
    type: "Boolean",
    omitted: true,
    disabled: true,
    required: false,
    localized: false,
    defaultValue: {
      "en-US": true,
    },
  });

  let cType: ContentType;
  try {
    cType = await environment.getContentType(contentTypeId);

    // NONE OF THIS WORKS!!!!!!!
    // cType = await cType.omitAndDeleteField("contentAlignment");
    // console.log("cType OD", JSON.parse(JSON.stringify(cType)));
    // Step 1: Omit fields not in the new definition
    // const newFieldIds = new Set((newCType.fields || []).map((f) => f.id));
    // // Omit
    // for (const field of cType.fields) {
    //   if (!newFieldIds.has(field.id)) {
    //     field.omitted = true;
    //   }
    // }
    // console.log("cType OMIT 1", JSON.parse(JSON.stringify(cType)));
    // cType = await cType.update();
    // console.log("cType OMIT 2", JSON.parse(JSON.stringify(cType)));
    // Delete
    // for (const field of cType.fields) {
    //   if (!newFieldIds.has(field.id)) {
    //     field.deleted = true;
    //   }
    // }
    // console.log("cType DEL 1", JSON.parse(JSON.stringify(cType)));
    // cType = await cType.update();
    // console.log("cType DEL 2", JSON.parse(JSON.stringify(cType)));

    // JUST ADDING IGNORED FIELDS FOR NOW...
    const newFieldIds = new Set((newCType.fields || []).map((f) => f.id));
    for (const field of cType.fields) {
      if (!newFieldIds.has(field.id)) {
        field.omitted = true;
        newCType.fields.push({ ...field });
      }
    }

    cType.name = newCType.name || "";
    cType.description = newCType.description || "";
    cType.fields = newCType.fields || [];

    cType = await cType.update();
    return await cType.publish();
  } catch (err: any) {
    console.log("err", err);
    if (err.name === "NotFound") {
      cType = await environment.createContentTypeWithId(
        contentTypeId,
        newCType
      );
      return await cType.publish();
    }
    return false;
  }
}
