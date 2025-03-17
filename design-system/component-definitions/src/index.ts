import define from "./decorators/define";
import defineSlot from "./decorators/defineSlot";
import defineHidden from "./decorators/defineHidden";
import defineExample from "./decorators/defineExample";
import defineStageCss from "./decorators/defineStageCss";
import defineDesignProperty from "./decorators/defineDesignProperty";
import defineComponent, {
  CDefDesignProperty,
} from "./decorators/defineComponent";
import webCompObjToString from "./preview/webCompObjToString";

import propertyHasOneExternalRef from "./transformers/utils/propertyHasOneExternalRef";
import definitionInstanceToWebInstance from "./transformers/definitionInstanceToWebInstance";
import contentfulInstanceToDefinitionInstance from "./transformers/contentfulInstanceToDefinitionInstance";
import figmaInstanceToDefinitionInstance from "./transformers/figmaInstanceToDefinitionInstance";
import definitionInstanceToFigmaInstance from "./transformers/definitionInstanceToFigmaInstance";
import htmlInstanceToDefinitionInstance from "./transformers/clientSide/htmlInstanceToDefinitionInstance";

import lintFigmaComponent from "./linters/lintFigmaComponent";
import lintContentfulComponent from "./linters/lintContentfulComponent";
import cDefToString from "./decorators/utils/cDefToString";
import schemaToIdentifier from "./utils/schemaToIdentifier";
import getComponentDefinition from "./transformers/utils/getComponentDefinition";
import findFigmaSlots from "./utils/findFigmaSlots";
import findExposedChildren from "./utils/findExposedChildren";
import layoutToCss from "./transformers/utils/layoutToCss";
import { applyProperties } from "./transformers/figmaUtils/applyProperties";
import layoutsToCss, { layoutDesignProps } from "./css/layoutsToCss";
import {
  findLayoutValue,
  setLayoutToStorate,
  getLayoutFromStorage,
  findLayoutPropertyName,
} from "./utils/layoutStorage";
import {
  COMPONENT_INSTANCE_PROPERTY,
  CDEF_INSTRINSIC_IDS,
  CDEF_LAYOUT_VALUE_TYPES,
} from "./constants";
import {
  CDefManifest,
  CDefLintResult,
  CDefLintPropertyResult,
  CDefLintError,
  CDefLintErrorCode,
  CDefLintErrorTarget,
  CDefDesignPropertyEnum,
  CDefLayoutValue,
  CDefTokens,
  CDefDefinition,
  CDefInstance,
  CDefLayout,
} from "./types";

export {
  define,
  defineSlot,
  defineDesignProperty,
  CDefDesignProperty,
  defineHidden,
  defineExample,
  defineStageCss,
  defineComponent,
  webCompObjToString,
  cDefToString,
  propertyHasOneExternalRef,
  definitionInstanceToWebInstance,
  definitionInstanceToFigmaInstance,
  contentfulInstanceToDefinitionInstance,
  figmaInstanceToDefinitionInstance,
  htmlInstanceToDefinitionInstance,
  lintFigmaComponent,
  lintContentfulComponent,
  schemaToIdentifier,
  getComponentDefinition,
  findFigmaSlots,
  findExposedChildren,
  layoutToCss,
  findLayoutValue,
  setLayoutToStorate,
  getLayoutFromStorage,
  findLayoutPropertyName,
  applyProperties,
  layoutsToCss,
  layoutDesignProps,
  COMPONENT_INSTANCE_PROPERTY,
  CDEF_INSTRINSIC_IDS,
  CDEF_LAYOUT_VALUE_TYPES,
  CDefLintErrorCode,
  CDefLintErrorTarget,
  CDefDesignPropertyEnum,
};

export type {
  CDefManifest,
  CDefLintResult,
  CDefLintPropertyResult,
  CDefLintError,
  CDefLayoutValue,
  CDefTokens,
  CDefDefinition,
  CDefInstance,
  CDefLayout,
};
