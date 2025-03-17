import { CDefDesignProperty } from "../../decorators/defineComponent";
import { CDefInstance, CDefTokenLookup } from "../../types";
import {
  findFigmaCompositePropViaTokenLookup,
  findFigmaPropViaTokenLookup,
} from "../../utils/findViaTokenLookup";
import {
  processSlotChildren,
  processTextChildren,
} from "../utils/findSlotChildren";

export async function applyStyleProperties(
  figmaInstance: InstanceNode,
  defInstance: CDefInstance,
  tokenLookup: CDefTokenLookup | undefined,
  allVarsLookup: { [name: string]: {}[] },
  figma: any, // Figma API,
  isRoot: boolean
) {
  // Need to apply this AFTER changing other things...
  // Is applied after the switch
  let layoutSizingVertical: "FIXED" | "HUG" | "FILL" = "HUG";
  let layoutSizingHorizontal: "FIXED" | "HUG" | "FILL" = "HUG";
  // only applied if layout is Fixed;
  let width: number = 500;
  let height: number = 500;

  let layoutDirection: string | undefined = "column";
  let alignItems: string | undefined;
  let justifyContent: string | undefined;

  const defInstanceEntries = Object.entries(defInstance);
  for (const [key, value] of defInstanceEntries) {
    switch (key) {
      case CDefDesignProperty.BACKGROUND_COLOR: {
        const figmaProp = findFigmaPropViaTokenLookup(`${value}`, tokenLookup);
        const figmaPropVar = await findPropertyObjectVariable(
          figmaProp,
          allVarsLookup,
          figma
        );
        if (figmaPropVar) {
          figmaInstance.fills = [
            figma.variables.setBoundVariableForPaint(
              figma.util.solidPaint("#000000ff"),
              "color",
              figmaPropVar
            ),
          ];
        }
        // TODO: find style...
        break;
      }
      case CDefDesignProperty.TEXT_COLOR: {
        const figmaProp = findFigmaPropViaTokenLookup(`${value}`, tokenLookup);
        const figmaPropVar = await findPropertyObjectVariable(
          figmaProp,
          allVarsLookup,
          figma
        );
        if (figmaPropVar) {
          figmaInstance.children.map((child: any) => {
            if (child.type === "TEXT") {
              child.fills = [
                figma.variables.setBoundVariableForPaint(
                  figma.util.solidPaint("#000000ff"),
                  "color",
                  figmaPropVar
                ),
              ];
            }
          });
        }
        break;
      }
      case CDefDesignProperty.FONT: {
        const figmaProp = findFigmaCompositePropViaTokenLookup(
          `${value}`,
          tokenLookup
        );
        if (figmaProp && typeof figmaProp === "object") {
          const weightFigmaProp = findFigmaPropViaTokenLookup(
            `${figmaProp.weight}`,
            tokenLookup
          );
          const weightFigmaPropVar = await findPropertyObjectVariable(
            weightFigmaProp,
            allVarsLookup,
            figma
          );

          const sizeFigmaProp = findFigmaPropViaTokenLookup(
            `${figmaProp.size}`,
            tokenLookup
          );
          const sizeFigmaPropVar = await findPropertyObjectVariable(
            sizeFigmaProp,
            allVarsLookup,
            figma
          );

          const lineHeightFigmaProp = findFigmaPropViaTokenLookup(
            `${figmaProp.lineHeight}`,
            tokenLookup
          );
          const lineHeightFigmaPropVar = await findPropertyObjectVariable(
            lineHeightFigmaProp,
            allVarsLookup,
            figma
          );

          const familyFigmaProp = findFigmaPropViaTokenLookup(
            `${figmaProp.family}`,
            tokenLookup
          );
          const familyFigmaPropVar = await findPropertyObjectVariable(
            familyFigmaProp,
            allVarsLookup,
            figma
          );

          figmaInstance.children.map((child: any) => {
            if (child.type === "TEXT") {
              child.setBoundVariable("fontWeight", weightFigmaPropVar);
              child.setBoundVariable("fontSize", sizeFigmaPropVar);
              child.setBoundVariable("lineHeight", lineHeightFigmaPropVar);
              // TODO: see if font needs to be loaded?
              child.setBoundVariable("fontFamily", familyFigmaPropVar);
            }
          });
        }
        break;
      }
      case CDefDesignProperty.BORDER_COLOR: {
        const figmaProp = findFigmaPropViaTokenLookup(`${value}`, tokenLookup);
        const figmaPropVar = await findPropertyObjectVariable(
          figmaProp,
          allVarsLookup,
          figma
        );
        if (figmaPropVar) {
          const newStrokes: any[] = [
            figma.variables.setBoundVariableForPaint(
              figma.util.solidPaint("#000000ff"),
              "color",
              figmaPropVar
            ),
          ];
          figmaInstance.strokes = newStrokes;
        }
        // TODO: find style...
        break;
      }
      case CDefDesignProperty.PADDING: {
        // TODO: split into four...
        const figmaProp = findFigmaPropViaTokenLookup(`${value}`, tokenLookup);
        const figmaPropVar = await findPropertyObjectVariable(
          figmaProp,
          allVarsLookup,
          figma
        );
        if (figmaPropVar) {
          figmaInstance.setBoundVariable("paddingLeft", figmaPropVar);
          figmaInstance.setBoundVariable("paddingRight", figmaPropVar);
          figmaInstance.setBoundVariable("paddingTop", figmaPropVar);
          figmaInstance.setBoundVariable("paddingBottom", figmaPropVar);
        }
        break;
      }
      case CDefDesignProperty.CORNER_RADIUS: {
        // TODO: split into four...
        const figmaProp = findFigmaPropViaTokenLookup(`${value}`, tokenLookup);
        const figmaPropVar = await findPropertyObjectVariable(
          figmaProp,
          allVarsLookup,
          figma
        );
        if (figmaPropVar) {
          figmaInstance.setBoundVariable("topLeftRadius", figmaPropVar);
          figmaInstance.setBoundVariable("topRightRadius", figmaPropVar);
          figmaInstance.setBoundVariable("bottomLeftRadius", figmaPropVar);
          figmaInstance.setBoundVariable("bottomRightRadius", figmaPropVar);
        }
        break;
      }
      case CDefDesignProperty.BORDER_WIDTH: {
        // TODO: split into four...
        const figmaProp = findFigmaPropViaTokenLookup(`${value}`, tokenLookup);
        const figmaPropVar = await findPropertyObjectVariable(
          figmaProp,
          allVarsLookup,
          figma
        );
        if (figmaPropVar) {
          figmaInstance.setBoundVariable("strokeTopWeight", figmaPropVar);
          figmaInstance.setBoundVariable("strokeRightWeight", figmaPropVar);
          figmaInstance.setBoundVariable("strokeBottomWeight", figmaPropVar);
          figmaInstance.setBoundVariable("strokeLeftWeight", figmaPropVar);
        }
        break;
      }
      // NADA
      // case CDefDesignProperty.BORDER_STYLE : {
      //     if (value && `${value}`.toLowerCase() === 'dashed') {
      //         // const strokes = JSON.parse(JSON.stringify(figmaInstance.strokes));
      //         // if (strokes.length > 0) {
      //         //     strokes[0].strokeDashes = [10, 5];
      //         // }
      //         // figmaInstance.strokes = strokes;
      //     }
      //     console.log('figmaInstance', figmaInstance);
      //     break;
      // }
      case CDefDesignProperty.LAYOUT_DIRECTION: {
        layoutDirection = `${value}`;
        break;
      }
      case CDefDesignProperty.HORIZONTAL_RESIZING: {
        switch (`${value}`.toLowerCase()) {
          case "hug": {
            layoutSizingHorizontal = "HUG";
            break;
          }
          case "fixed": {
            layoutSizingHorizontal = "FIXED";
            break;
          }
          case "fill": {
            layoutSizingHorizontal = "FILL";
            break;
          }
        }
        break;
      }
      case CDefDesignProperty.VERTICAL_RESIZING: {
        switch (`${value}`.toLowerCase()) {
          case "hug": {
            layoutSizingVertical = "HUG";
            break;
          }
          case "fixed": {
            layoutSizingVertical = "FIXED";
            break;
          }
          case "fill": {
            layoutSizingVertical = "FILL";
            break;
          }
        }
        break;
      }
      // Figma doesn't really have this...need fixed with page
      // case CDefDesignProperty.VERTICAL_FLEX_GROW : { break; }
      // case CDefDesignProperty.HORIZONTAL_FLEX_GROW : { break; }
      case CDefDesignProperty.WIDTH: {
        width = parseInt(`${value}`.replace(/[^0-9]+/g, ""));
        break;
      }
      case CDefDesignProperty.HEIGHT: {
        height = parseInt(`${value}`.replace(/[^0-9]+/g, ""));
        break;
      }
      case CDefDesignProperty.ALIGN_ITEMS: {
        alignItems = `${value}`.toLowerCase();
        break;
      }
      case CDefDesignProperty.JUSTIFY_CONTENT: {
        justifyContent = `${value}`.toLowerCase();
        break;
      }
    }
  }

  // Layout Direction
  processSlotChildren(figmaInstance, (slot: any) => {
    if (slot.componentProperties.layoutDirection) {
      (slot as InstanceNode).setProperties({
        layoutDirection:
          layoutDirection?.toLowerCase() === "column"
            ? "vertical"
            : "horizontal",
      });
    }
  });

  // Align Items and Justify Content
  if (alignItems) {
    processSlotChildren(figmaInstance, (slot: any) => {
      switch (alignItems) {
        case "start": {
          slot.counterAxisAlignItems = "MIN";
          break;
        }
        case "center": {
          slot.counterAxisAlignItems = "CENTER";
          break;
        }
        case "end": {
          slot.counterAxisAlignItems = "MAX";
          break;
        }
        case "stretch": {
          slot.counterAxisAlignItems = "STRETCH";
          break;
        }
      }
    });
  }
  if (justifyContent) {
    processSlotChildren(figmaInstance, (slot: any) => {
      switch (justifyContent) {
        case "start": {
          slot.primaryAxisAlignItems = "MIN";
          break;
        }
        case "center": {
          slot.primaryAxisAlignItems = "CENTER";
          break;
        }
        case "end": {
          slot.primaryAxisAlignItems = "MAX";
          break;
        }
        case "space-between": {
          slot.primaryAxisAlignItems = "SPACE_BETWEEN";
          break;
        }
      }
    });
  }

  if (layoutSizingHorizontal === "FIXED" && layoutSizingVertical === "FIXED") {
    // con sole.log('[resize] width, height', width, height);
    figmaInstance.resize(width, height);
  } else {
    if (layoutSizingHorizontal === "FIXED") {
      // con sole.log('[resize] width, figmaInstance.height', width, figmaInstance.height);
      figmaInstance.resize(width, figmaInstance.height);
    } else if (layoutSizingVertical === "FIXED") {
      // con sole.log('[resize] figmaInstance.width, height', figmaInstance.width, height);
      figmaInstance.resize(figmaInstance.width, height);
    }
  }

  if (isRoot) {
    if (layoutSizingHorizontal === "FILL" && figmaInstance.parent) {
      figmaInstance.resize(
        (figmaInstance.parent as FrameNode).width - 100,
        figmaInstance.height
      );
      processSlotChildren(figmaInstance, (slot: any) => {
        slot.layoutSizingHorizontal = "FILL";
      });
    }
    if (layoutSizingHorizontal === "HUG") {
      figmaInstance.layoutSizingHorizontal = layoutSizingHorizontal;
      processSlotChildren(figmaInstance, (slot: any) => {
        slot.layoutSizingHorizontal = "HUG";
      });
    }
    if (layoutSizingHorizontal === "FIXED") {
      console.log("FIXED ROOT");
      figmaInstance.layoutSizingHorizontal = layoutSizingHorizontal;
      processSlotChildren(figmaInstance, (slot: any) => {
        slot.layoutSizingHorizontal = "FILL";
      });
    }
  } else {
    if ((figmaInstance?.parent as any)?.layoutMode !== "NONE") {
      figmaInstance.layoutSizingHorizontal = layoutSizingHorizontal;
      figmaInstance.layoutSizingVertical = layoutSizingVertical;
      if (layoutSizingHorizontal === "FILL") {
        processSlotChildren(figmaInstance, (slot: any) => {
          slot.layoutSizingHorizontal = "FILL";
        });
        processTextChildren(figmaInstance, (text: TextNode) => {
          console.log("TEXT!!!!!!", text);
          text.layoutSizingHorizontal = "FILL";
        });
      }
      if (layoutSizingHorizontal === "HUG") {
        processSlotChildren(figmaInstance, (slot: any) => {
          slot.layoutSizingHorizontal = "HUG";
        });
        processTextChildren(figmaInstance, (text: TextNode) => {
          text.layoutSizingHorizontal = "HUG";
        });
      }
    }
  }
}

export async function findPropertyObjectVariable(
  figmaPropStr: string | undefined,
  allVarsLookup: any,
  figma: any
) {
  if (!figmaPropStr) return;
  if (figmaPropStr.indexOf("variable:") === 0) {
    const figmaVarName = figmaPropStr.substring("variable:".length);
    const varObjReference = allVarsLookup[figmaVarName];
    if (varObjReference && varObjReference.length > 0) {
      const varObj = await figma.variables.importVariableByKeyAsync(
        varObjReference[0].key
      );
      return varObj;
    }
  }
  return;
}

export async function getAllVariablesLookup(figma: any) {
  const allVarsLookup: { [name: string]: {}[] } = {};
  const localVariables = await figma.variables.getLocalVariablesAsync();
  const libraryVariableCollections =
    await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
  for (const libraryVarCollection of libraryVariableCollections) {
    const teamVariables =
      await figma.teamLibrary.getVariablesInLibraryCollectionAsync(
        libraryVarCollection.key
      );
    teamVariables.map((teamVar: any) => {
      if (!allVarsLookup[teamVar.name]) allVarsLookup[teamVar.name] = [];
      allVarsLookup[teamVar.name].push(teamVar); // could be dups...just using first however...
    });
  }
  // put local as last...
  localVariables.map((localVar: any) => {
    if (!allVarsLookup[localVar.name]) allVarsLookup[localVar.name] = [];
    allVarsLookup[localVar.name].push(localVar); // could be dups...just using first however...
  });
  return allVarsLookup;
}

export async function getAllVariablesLookupViaId(figma: any) {
  const allVarsLookup: { [name: string]: {}[] } = {};
  const localVariables = await figma.variables.getLocalVariablesAsync();
  const libraryVariableCollections =
    await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
  for (const libraryVarCollection of libraryVariableCollections) {
    const teamVariables =
      await figma.teamLibrary.getVariablesInLibraryCollectionAsync(
        libraryVarCollection.key
      );
    teamVariables.map((teamVar: any) => {
      if (!allVarsLookup[teamVar.id]) allVarsLookup[teamVar.id] = [];
      allVarsLookup[teamVar.id].push(teamVar); // could be dups...just using first however...
    });
  }
  // put local as last...
  localVariables.map((localVar: any) => {
    if (!allVarsLookup[localVar.id]) allVarsLookup[localVar.id] = [];
    allVarsLookup[localVar.id].push(localVar); // could be dups...just using first however...
  });
  return allVarsLookup;
}
