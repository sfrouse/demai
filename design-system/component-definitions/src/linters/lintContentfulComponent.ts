import getComponentDefinition from "../transformers/utils/getComponentDefinition";
import {
  CDefLintError,
  CDefLintErrorCode,
  CDefLintErrorTarget,
  CDefLintPropertyResult,
  CDefLintResult,
} from "../types";
import tallyErrorsForResults from "./utils/tallErrorsForResults";
import * as contentful from "contentful-management";

export default async function lintContentfulComponent(
  contentType: contentful.ContentType,
  cDefRootUrl: string
): Promise<CDefLintResult | undefined> {
  if (!contentType) {
    console.log("no figma comp");
    return;
  }

  const cTypeId = contentType.sys.id;
  const compDefinition = await getComponentDefinition(cDefRootUrl, cTypeId);
  if (!compDefinition) {
    console.error(`Component Definition not found`, cDefRootUrl, cTypeId);
    return;
  }

  const lintResults: CDefLintResult = {
    id: cTypeId,
    properties: [],
    errors: [],
    totalErrors: 0,
    valid: true,
  };

  // Content Cycling First...
  const contentTypeFieldLookup: any = {};
  let hasCompInstanceProp = false;
  const componentInstanceName = "componentInstance";
  await Promise.all(
    contentType.fields.map((field) => {
      return (async () => {
        contentTypeFieldLookup[field.id] = field;
        if (field.id === componentInstanceName) {
          hasCompInstanceProp = true;
          const propResult: CDefLintPropertyResult = {
            name: field.id,
            valid: true,
            errors: [],
          };
          lintResults.properties.push(propResult);
          return;
        }
        if (!compDefinition.properties) return;
        if (compDefinition.properties[field.id]) {
          // const cDef = compDefinition.properties[field.id];
        } else {
          const propResult: CDefLintPropertyResult = {
            name: field.id,
            valid: false,
            errors: [
              {
                errorCode: CDefLintErrorCode.MissingProperty,
                target: CDefLintErrorTarget.Definition,
                message: `Component Definition property missing.`,
                code: {
                  web: `@defineHidden('${field.name}')\n\t${field.id}: string;`,
                },
              },
            ],
          };
          lintResults.properties.push(propResult);
        }
        return true;
      })();
    })
  );
  if (hasCompInstanceProp === false) {
    const propResult: CDefLintPropertyResult = {
      name: componentInstanceName,
      valid: false,
      errors: [
        {
          errorCode: CDefLintErrorCode.MissingProperty,
          target: CDefLintErrorTarget.Content,
          message: `Content Type field missing.`,
        },
      ],
    };
    lintResults.properties.push(propResult);
  }

  if (compDefinition.properties) {
    await Promise.all(
      Object.entries(compDefinition.properties).map((defPropInfo) => {
        return (async () => {
          const defName = defPropInfo[0];
          const defProp = defPropInfo[1];

          // can ignore special defNames
          if (defName === "$schema") return;
          if (defName === "$identifier") return;
          if (defName === componentInstanceName) return;

          // look for the equvilant in figma...
          let contentTypeField;
          if (contentTypeFieldLookup) {
            contentTypeField = contentTypeFieldLookup[defName];
          }

          let propErrors: CDefLintError[] = [];
          if (defProp["x-cdef"] && defProp["x-cdef"].hidden !== true) {
            // just ignore any errors if hidden prop
            if (contentTypeField) {
              if (defProp["x-cdef"]?.content?.content !== true) {
                propErrors.push({
                  errorCode: CDefLintErrorCode.ShouldNotBeContent,
                  target: CDefLintErrorTarget.Content,
                  message: `Property should NOT be content driven.`,
                });
              }
            } else {
              if (defProp["x-cdef"]?.content?.content === true) {
                propErrors.push({
                  errorCode: CDefLintErrorCode.MissingProperty,
                  target: CDefLintErrorTarget.Content,
                  message: defProp.enum
                    ? `Content Type enum missing (options: ${defProp.enum.join(", ")})`
                    : `Content Type field missing.`,
                });
              }
            }
          }

          const propResult: CDefLintPropertyResult = {
            name: defName,
            valid: propErrors.length > 0 ? false : true,
            errors: propErrors,
            property: defProp,
          };
          lintResults.properties.push(propResult);
          return true;
        })();
      })
    );
  }

  tallyErrorsForResults(lintResults);

  // sort
  lintResults.properties = [...lintResults.properties].sort((a: any, b: any) =>
    a.name.localeCompare(b.name)
  );
  return lintResults;
}
