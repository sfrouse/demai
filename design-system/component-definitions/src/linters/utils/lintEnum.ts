import {
    CDefDefinition,
    CDefLintError,
    CDefLintErrorCode,
    CDefLintErrorTarget
} from "../../types";
import arrayDifference from "./arrayDifference";

export default function lintEnum(
    defProp: CDefDefinition,
    figmaProp: any,
    propErrors: CDefLintError[]
) {
    if (
        defProp.enum &&
        figmaProp.type === 'VARIANT',
        Array.isArray(figmaProp.variantOptions)
    ) {
        // now the opposite way...
        const arrDiffs = arrayDifference(defProp.enum as [], figmaProp.variantOptions);
        if (arrDiffs[0].length > 0) {
            arrDiffs[0].map(diff => {
                propErrors.push({
                    errorCode: CDefLintErrorCode.MissingEnum,
                    target: CDefLintErrorTarget.Design,
                    message: `"${diff}" is missing from Figma variant options (options: ${
                        (defProp.enum as []).join(', ')})`,
                });
            });
        }
        if (arrDiffs[1].length > 0) {
            arrDiffs[1].map(diff => {
                propErrors.push({
                    errorCode: CDefLintErrorCode.MissingEnum,
                    target: CDefLintErrorTarget.Definition,
                    message: `"${diff}" is missing from Component Definition enums (options: ${
                        (defProp.enum as []).join(', ')})`,
                });
            });
        }
        return;
    }

    if (figmaProp.type !== 'VARIANT') {
        propErrors.push({
            errorCode: CDefLintErrorCode.MalformedEnum,
            target: CDefLintErrorTarget.Design,
            message: `Figma property must be a variant`,
        });
    }

    if (!Array.isArray(figmaProp.variantOptions)) {
        propErrors.push({
            errorCode: CDefLintErrorCode.MalformedEnum,
            target: CDefLintErrorTarget.Design,
            message: `Figma property must have an array of variant options (options: ${
                (defProp.enum as []).join(', ')})`,
        });
    }
    
}