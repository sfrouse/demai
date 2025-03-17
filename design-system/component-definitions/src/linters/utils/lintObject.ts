import stringToCDefId from "../../decorators/utils/stringToCDefId";
import {
    CDefDefinition,
    CDefLintError,
    CDefLintErrorCode,
    CDefLintErrorTarget
} from "../../types";

export default async function lintObject(
    defProp: CDefDefinition,
    figmaProp: any,
    propErrors: CDefLintError[],
    figma: any // Figma API
) {
    if (Array.isArray(figmaProp.preferredValues)) {
        await Promise.all(
            figmaProp.preferredValues.map((value: any) => {
                return (async () => {
                    let comp;
                    if (value.type === "COMPONENT_SET") {
                        comp = await figma.importComponentSetByKeyAsync(value.key)
                            .catch((err: any) => {
                                console.log('err', err);
                                propErrors.push({
                                    errorCode: CDefLintErrorCode.UnloadedSwapRef,
                                    target: CDefLintErrorTarget.Design,
                                    message: `Figma instance swap reference is not available (needs to be published to lint), key: ${value.key}.`,
                                });
                            });
                    }else if (value.type === "COMPONENT") {
                        comp = await figma.importComponentByKeyAsync(value.key)
                            .catch((err: any) => {
                                console.log('err', err);
                                propErrors.push({
                                    errorCode: CDefLintErrorCode.MismatchedSwapRef,
                                    target: CDefLintErrorTarget.Design,
                                    message: `Figma instance swap reference is not available (needs to be published to lint), key: ${value.key}.`,
                                });
                            });
                        
                    }
                    if (comp) {
                        const compId = stringToCDefId(comp.name);
                        if (defProp.$ref !== compId) {
                            propErrors.push({
                                errorCode: CDefLintErrorCode.MismatchedSwapRef,
                                target: CDefLintErrorTarget.Design,
                                message: `Figma instance swap possible selection "${compId}" doesn't match definition ref "${defProp.$ref}".`,
                            });
                        }
                    }
                })();
            })
        );
    }else{
        propErrors.push({
            errorCode: CDefLintErrorCode.MalformedObject,
            target: CDefLintErrorTarget.Design,
            message: `Figma instance swap has no options.`,
        }); 
    }
}