import { createClient } from "contentful-management";
import type { CDefDefinition } from "demai-component-definitions/dist/types.d.ts";
import { DEMAI_COMPONENT_CTYPE_ID } from "../ctypes/demaiComponentCType";
import createCTypeFromCDef from "../../functions/utils/createCTypeFromCDef/createCTypeFromCDef";
import webComponentManifest from "./webComponentManifest";

export type WebComponentInfo = {
  id: string;
  code: string;
  cdef: CDefDefinition;
};

export default async function installWebComponents(
  cmaToken: string,
  spaceId: string,
  environmentId: string,
  errors: string[] = []
) {
  const manifest = webComponentManifest;
  const promiseArr = [];
  for (const compInfo of manifest) {
    promiseArr.push(
      (async () => {
        try {
          return installWebComponent(
            cmaToken,
            spaceId,
            environmentId,
            compInfo,
            errors
          );
        } catch {}
      })()
    );
  }
}

export async function installWebComponent(
  cmaToken: string,
  spaceId: string,
  environmentId: string,
  compInfo: WebComponentInfo,
  errors: string[]
): Promise<{
  success: boolean;
  content: string;
}> {
  const client = createClient({ accessToken: cmaToken });
  const space = await client.getSpace(spaceId);
  const environment = await space.getEnvironment(environmentId);

  const webCompId = compInfo.cdef["x-cdef"].tag;
  if (webCompId) {
    try {
      // Check for Entry First
      const compEntry = await environment.getEntry(webCompId);
      console.log(
        "Found comp entry, publishing and creating ctype, but ignoring",
        compEntry
      );
      await compEntry.publish();
      await createCTypeFromCDef(
        cmaToken,
        spaceId,
        environmentId,
        compInfo.cdef
      );
      return {
        success: true,
        content: "Component already exists",
      };
    } catch {
      console.log(`No entry found with ID "${webCompId}", creating one...`);
    }

    try {
      // Check for demai-component content type
      const componentCType = await environment.getContentType(
        DEMAI_COMPONENT_CTYPE_ID
      );
      console.log("componentCType", componentCType);
    } catch {
      console.log(
        `No content type found with ID "${DEMAI_COMPONENT_CTYPE_ID}", stopping....`
      );
      errors.push(
        `No content type found with ID "${DEMAI_COMPONENT_CTYPE_ID}", stopping....`
      );
      return {
        success: false,
        content: `No content type found with ID "${DEMAI_COMPONENT_CTYPE_ID}", stopping....`,
      };
    }

    // let's make it...
    const entry = await environment.createEntryWithId(
      DEMAI_COMPONENT_CTYPE_ID,
      webCompId,
      {
        fields: {
          title: { "en-US": webCompId },
          description: { "en-US": `${compInfo.cdef?.description || ""}` },
          componentDefinition: { "en-US": compInfo.cdef },
          javascript: { "en-US": compInfo.code },
          bindings: { "en-US": {} },
        },
      }
    );

    await entry.publish();
    await createCTypeFromCDef(
      cmaToken,
      spaceId,
      environmentId,
      compInfo.cdef,
      errors
    );

    return {
      success: true,
      content: "Created component",
    };
  }

  errors.push(`Component id not found`);
  return {
    success: false,
    content: "Component id not found",
  };
}
