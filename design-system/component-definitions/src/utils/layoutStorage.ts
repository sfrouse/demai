import { LAYOUT_PLUGIN_NAME } from "../constants";
import { CDefDefinition, CDefInstance, CDefLayoutValue } from "../types";

export function setLayoutToStorate(
    defInstance: CDefInstance,
    compDefinition: CDefDefinition,
    figmaInstance: any // InstanceNode
) {
    const layout = findLayoutValue(defInstance, compDefinition);
    figmaInstance.setPluginData(LAYOUT_PLUGIN_NAME, JSON.stringify(layout));
}

export function getLayoutFromStorage(
    figmaInstance: any // InstanceNode
) {
    const layoutInfo = figmaInstance.getPluginData(LAYOUT_PLUGIN_NAME);
    if (layoutInfo) {
        return JSON.parse(layoutInfo);
    }
    return {};
}

export function findLayoutPropertyName(
    compDefinition: CDefDefinition,
) {
    let layoutPropName: string | undefined;
    if (!compDefinition.properties) return;
    Object.entries(compDefinition.properties).find(entry => {
        const name = entry[0];
        const defProp = entry[1] as CDefDefinition;
        if (defProp["x-cdef"]?.input?.inputType === 'layout') {
            layoutPropName = name;
            return true;
        }
        return false;
    });
    return layoutPropName;
}

export function findLayoutValue (
    defInstance: CDefInstance,
    compDefinition: CDefDefinition,
) {
    const layoutPropName = findLayoutPropertyName(compDefinition);

    if (layoutPropName) {
        return defInstance[layoutPropName] as CDefLayoutValue;
    }
}