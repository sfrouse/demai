import {
    CDefLintError,
    CDefLintErrorCode,
    CDefLintErrorTarget
} from "../../types";

export default function lintString(
    figmaProp: any,
    propErrors: CDefLintError[]
) {
    if (
        figmaProp.type === 'VARIANT',
        Array.isArray(figmaProp.variantOptions)
    ) {
        propErrors.push({
            errorCode: CDefLintErrorCode.MalformedString,
            target: CDefLintErrorTarget.Design,
            message: `Figma property is an enumeration, not a string.`,
        });
    }
}