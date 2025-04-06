import { DesignSystemMCPClient } from "../../DesignSystemMCPClient";
import ensureDemAIComponentEntry from "../../functions/utils/demaiComponent/ensureDemAIComponentEntry";
import {
  kebabToClassName,
  kebabToSentence,
} from "../../functions/utils/kebabTransforms";

export default async function createComponentDefinitionFunction(
  mcp: DesignSystemMCPClient,
  params: any
) {
  // TODO: type CDefDefinition
  const cDef: any = {
    $id: `${params.id}.cdef.json`,
    $schema: "https://json-schema.org/draft-07/schema",
    $comment: "AI GENERATED",
    type: "object",
    additionalProperties: false,
    description: params.description,
    "x-cdef": {
      tag: params.id,
      className: kebabToClassName(params.id),
      name: params.name,
    },
    properties: {
      $schema: {
        type: "string",
      },
      $identifier: {
        type: ["string", "object"],
      },
    },
  };

  params.properties.map((prop: any) => {
    const cdefProp: any = {
      $schema: "https://json-schema.org/draft-07/schema",
      title: prop.title,
      type: prop.type,
      description: prop.description,
      "x-cdef": {
        input: {
          label: prop.title,
          //   inputType: "select",
        },
        output: {
          webComponent: {
            attribute: prop.id,
          },
        },
      },
    };

    if (prop.enum) {
      cdefProp.enum = prop.enum;
      cdefProp["x-cdef"].input.options = {};
      (prop.enum as []).map((enumValue: string) => {
        // TODO: make the name more label like
        cdefProp["x-cdef"].input.options[kebabToSentence(enumValue)] =
          enumValue;
      });
    }
    if (prop.defaultValue) {
      cdefProp["x-cdef"].input.defaultValue = prop.defaultValue;
    }

    cDef.properties[prop.id] = cdefProp;
  });

  await ensureDemAIComponentEntry(
    mcp.cma,
    mcp.spaceId,
    mcp.environmentId,
    params.id,
    {
      title: params.name,
      description: params.description,
      componentDefinition: cDef,
      // javascript: "",
      // binding: { event: "click", action: "alert('Clicked!')" },
    }
  );

  return {
    content: [
      {
        type: "object",
        text: `${JSON.stringify(cDef)}`,
      },
    ],
  };
}
