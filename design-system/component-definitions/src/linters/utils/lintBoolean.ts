import {
    CDefLintError,
    CDefLintErrorCode,
    CDefLintErrorTarget
} from "../../types";

export default function lintBoolean(
    figmaProp: any,
    propErrors: CDefLintError[]
) {
    if (
        figmaProp.type === 'VARIANT',
        Array.isArray(figmaProp.variantOptions)
    ) {
        const options = figmaProp.variantOptions;
        if (options.length !== 2) {
            propErrors.push({
                errorCode: CDefLintErrorCode.MalformedBoolean,
                target: CDefLintErrorTarget.Design,
                message: `Figma property does not have boolean options (true and false).`,
            });
        }
        figmaProp.variantOptions.map((option: any) => {
            if (
                option !== false &&
                option !== 0 &&
                option !== 'false' &&
                option !== 'no' &&
                option !== true &&
                option !== 1 &&
                option !== 'true' &&
                option !== 'yes'
            ) {
                propErrors.push({
                    errorCode: CDefLintErrorCode.MalformedBoolean,
                    target: CDefLintErrorTarget.Design,
                    message: `"${option}" is not a valid boolean enum in Figma.`,
                });
            }
        })
    }


}