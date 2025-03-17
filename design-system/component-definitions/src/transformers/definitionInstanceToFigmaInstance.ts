import { CDefInstance } from "../types";
import schemaToIdentifier from "../utils/schemaToIdentifier";
import { applyProperties } from "./figmaUtils/applyProperties";
import { applyStyleProperties, getAllVariablesLookup } from "./figmaUtils/applyStyleProperties";
import { processSlots } from "./figmaUtils/processSlots";
import { hasLayoutDefinition, isDefaultSlotDefinition } from "./figmaUtils/processSlots/isLayoutWithDefaultSlot";
import getComponentDefinition from "./utils/getComponentDefinition";
import getComponentDefinitionTokenLookup from "./utils/getComponentDefinitionTokenLookup";

export default async function definitionInstanceToFigmaInstance(
    defInstance: CDefInstance | undefined,
    cDefPath: string,
    figmaParentNode: any,
    figma: any, // Figma API
    onCreatedFunk?: (figmaInstance: InstanceNode) => void,
    resizeFunk?: (figmaInstance: InstanceNode) => void,
    isRoot: boolean = true
) {
    console.log('[definitionInstanceToFigmaInstance] defInstance', {
        defInstance,
        cDefPath,
        figmaParentNode,
        figma
    });

    if (!defInstance) {
        console.error('definitionInstanceToFigmaInstance: no defInstance')
        return;
    }
    // Find Component Definition from Definition Instance
    const compDefinition = await getComponentDefinition(cDefPath, defInstance.$schema as string );
    if (!compDefinition) {
        console.error(`Component Definition not found`, cDefPath, defInstance.$schema);
        return;
    }

    const tokenLookup = await getComponentDefinitionTokenLookup(cDefPath);
    const allVarsLookup = await getAllVariablesLookup(figma);

    // Find Figma Component
    // TODO: change to finding via Figma path
    const figmaCompName = schemaToIdentifier(defInstance.$schema as string);
    let figmaComponentSource = figma.root.findOne((node: any) => 
        node.name === figmaCompName &&
        ( node.type === "COMPONENT"  || node.type === "COMPONENT_SET" )
    );
    if (!figmaComponentSource) {
        console.error(`definitionInstanceToFigmaInstance: Component not found named "${figmaCompName}"`);
        return;
    }

    const hasLayout = hasLayoutDefinition(compDefinition);
    const hasDefaultSlot = isDefaultSlotDefinition(compDefinition);
    const isCompClone = hasDefaultSlot && hasLayout;
    if (isCompClone) {
        figmaComponentSource = figmaComponentSource.clone();
    }

    // Create Figma Instance
    let figmaInstance,
        figmaComponent: any | undefined,
        compPropDefs : any;
    if (figmaComponentSource.type === 'COMPONENT_SET') {
        figmaComponent = figmaComponentSource.defaultVariant;
        figmaInstance = figmaComponentSource.defaultVariant.createInstance();
        compPropDefs = figmaComponentSource.componentPropertyDefinitions;
    }else if (figmaComponentSource.type === 'COMPONENT'){
        figmaComponent = figmaComponentSource;
        figmaInstance = figmaComponentSource.createInstance();
        compPropDefs = figmaComponentSource.componentPropertyDefinitions;
    }
    if (!figmaInstance || !figmaComponent) {
        console.error(`definitionInstanceToFigmaInstance: Could not create figma instance`);
        return;
    }

    // Add to Figma Parent Node
    figmaParentNode.appendChild(figmaInstance);

    if (onCreatedFunk) {
        onCreatedFunk(figmaInstance);
    }
    
    // Update Figma Instance Properties
    applyProperties(
        figmaInstance,
        defInstance,
        compPropDefs
    );

    // Update Figma Instance Style Properties
    await applyStyleProperties( 
        figmaInstance,
        defInstance,
        tokenLookup,
        allVarsLookup,
        figma,
        isRoot
    );

    // Slots
    await processSlots(
        compDefinition,
        figmaComponent,
        figmaInstance,
        cDefPath,
        defInstance,
        isCompClone,
        tokenLookup,
        allVarsLookup
    );

    if (resizeFunk) {
        resizeFunk(figmaInstance);
    }

    if (isCompClone) {
        figmaComponentSource.remove();
    }

    return figmaInstance;
}