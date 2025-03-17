// ========== MANIFEST =============
export type CDefManifest = {
  baseFolder: string;
  componentJavascript: string;
  componentCSS: string;
  tokenLookup: string;
  definitions: { [tag: string]: CDefManifestDefinition };
  tokens: {
    tokens: string;
    lookups: {
      css: string;
      figma: string;
    };
  };
};

export type CDefTokenLookup = {
  tokens: CDefTokenLookupKeys[];
  lookup: { [key: string]: number };
};

export type CDefTokenLookupKeys = {
  global: string;
  css: string;
  figma: string;
  figmaComposite?: { [key: string]: string };
  js: string;
};

export type CDefTokens = {
  spacing: { [tag: string]: string };
  textColor: { [tag: string]: string };
  backgroundColor: { [tag: string]: string };
  typography: { [tag: string]: string };
  borderRadius: { [tag: string]: string };
};

export type CDefManifestDefinition = {
  id: string;
  title: string;
  file: string;
  examples: CDefExample[];
};

export type CDefExample = {
  name: string;
  description?: string;
  path?: string; // TODO: find diff between path and $id
  $id: string;
};

// ========== VALUES =================
export type CDefSpacing = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

// export type CDefApplyToProperty =  'padding' |
//   'margin' |'gap' | 'flex' | 'height' | 'direction' |
//   'verticalAlignment' | 'horizontalAlignment' | 'wrap';

// export type CDefApplyTo = {
//   property: CDefApplyToProperty,
//   slot: 'default'
// };

// Ven of Figma and CSS
export type CDefLayoutValue = {
  padding?: [
    string | number,
    string | number,
    string | number,
    string | number
  ];
  topPadding?: string | number;
  bottomPadding?: string | number;
  leftPadding?: string | number;
  rightPadding?: string | number;
  // margin: [string | number, string | number, string | number, string | number],
  gap?: [string | number] | [string | number, string | number];
  horizontalGap?: string | number;
  verticalGap?: string | number;
  horizontalAlignment?: "left" | "center" | "right";
  verticalAlignment?: "top" | "center" | "bottom";
  direction?: "horizontal" | "vertical";

  // ===== RESIZING =====
  position?: "relative" | "absolute";

  // horizontal
  horizontalResizing?: "fixed" | "fill" | "hug";
  width?: number; // if fixed...
  widthUnit?: "pixel" | "percent";
  widthFill?: number; // if fill...

  verticalResizing?: "fixed" | "fill" | "hug";
  height?: number; // if fixed...
  heightUnit?: "pixel" | "percent";
  heightFill?: number; // if fill...

  // css?: string,
  // cssId?: string, // way to localize css to individual
};

export enum CDefLayout {
  NONE = "none",
  COLUMN = "column",
  ROW = "row",
}

// export type CDefBoxDesignValue = {
//   backgroundColor?: string,
//   border?: {
//     color: string,
//     width: string | number,
//     style: 'solid' | 'dashed',
//   },
//   borderRadius?: string | number,
//   css?: string,
// }

// export type CDefTypographyValue = {
//   fontFace: string,
//   lineHeight: string,
//   style: 'italic' | 'normal',
//   textAlign: 'left' | 'center' | 'right',
//   css?: string,
// }

// export type CDefDesignPropertyValue =  'layout' | 'textColor' |
//   'backgroundColor' | 'textAligh' | 'typography' | 'resizing' | 'containment';

// ========== DEFINITION =============
// JSONSchema7Definition is JSONSchema7 | boolean which is causing issues downstream
export type CDefDefinition = import("json-schema").JSONSchema7 & {
  // causing weird TypeScript error...
  // $schema: 'https://json-schema.org/draft-07/schema' | {type: "string"},
  properties?: { [prop: string]: CDefDefinition };
  "x-cdef"?: {
    name?: string;
    tag?: string;
    className?: string;
    hidden?: boolean;
    design?: boolean;
    examples?: CDefExample[];
    figma?: {
      component: string;
    };
    import?: string;
    input?: {
      label: string;
      inputType: CDefDefinitionInputType | CDefDesignPropertyEnum;
      options?: { [name: string]: string };
      defaultValue?: any;
      required?: boolean;
      entryTitle?: boolean;
    };
    content?: {
      content?: boolean;
      contentfulId?: string;
      contentfulBuiltInStyles?: CTFBuiltInStyles[];
    };
    output?: {
      designProperty?: CDefDesignPropertyEnum;
      webComponent?: {
        attribute?: string;
        slot?: boolean;
        defaultSlot?: boolean; // otherwise prop name = slot name
        cssProperty?: string;
      };
      // applyTo?: CDefApplyTo,
      figma?: {
        property?: string;
      };
    };
  };
};

/** Component Definition Instance */
export type CDefInstance = { [key: string]: CDefInstanceValue };
export type CDefInstanceValue =
  | string
  | boolean
  | undefined
  | CDefInstanceRichText
  | CDefInstanceImage
  | CDefInstance
  | CDefLayoutValue; // |
// CDefBoxDesignValue |
// CDefTypographyValue;
export type CDefInstanceRichText = {
  $schema: "cdef-richtext.cdef.json";
  html: string;
  dom?: object;
};
export type CDefInstanceImage = {
  $schema: "cdef-image.cdef.json";
  url: string;
  title: string;
  contentType: string;
  dom?: object;
  // todo: sizing...extra style maybe
};

// type CDefDefinitionTypeExtensions = 'layout-group' | 'design-group' | 'typography-group';

export type CDefDefinitionType =
  | import("json-schema").JSONSchema7TypeName
  | import("json-schema").JSONSchema7TypeName[];

export enum CDefDesignPropertyEnum {
  // layout = 'layout',
  resizing = "resizing",
  textAlign = "textAlign",
  position = "position",
  // // Tokenized
  containment = "containment", // padding,
  // // break out into parts...

  // 1:1 tokenized
  textColor = "textColor",
  backgroundColor = "backgroundColor",
  typography = "typography",
}

export type CDefDefinitionInputType =
  | "string"
  | "slug"
  | "select"
  | "boolean"
  | "number"
  | "slider"
  | "color"
  | "array"
  // clusters
  | "layout" // auto-layout, layout grid, flex-box, css grid
  | "resizing" // flex, width/height abstractions
  | "typography" // typography
  | "textAlign"
  | "textColor" // text color
  | "backgroundColor" // background color
  | "border"
  // ---------
  | "unknown"
  | CDefDesignPropertyEnum
  | CDefDefinitionInputType[];

// LINTING
export type CDefLintResult = {
  id: string;
  valid: boolean;
  errors: CDefLintError[];
  totalErrors: number;
  properties: CDefLintPropertyResult[];
};

export type CDefLintPropertyResult = {
  name: string;
  valid: boolean;
  errors: CDefLintError[];
  property?: CDefDefinition; // if the CDef is missing the prop, then it's undefined
};

export type CDefLintError = {
  errorCode: CDefLintErrorCode;
  target: CDefLintErrorTarget;
  message: string;
  code?: {
    web?: string;
    figma?: string;
    content?: string;
  };
};

export enum CDefLintErrorCode {
  MissingProperty = "MissingProperty",
  MissingSlot = "MissingSlot",
  MissingEnum = "MissingEnum",
  MalformedEnum = "MalformedEnum",
  MalformedBoolean = "MalformedBoolean",
  MalformedString = "MalformedString",
  MalformedObject = "MalformedObject",
  UnloadedSwapRef = "UnloadedSwapRef",
  MismatchedSwapRef = "MismatchedSwapRef",
  ShouldNotBeContent = "ShouldNotBeContent",
}

export enum CDefLintErrorTarget {
  Design = "Design",
  Definition = "Definition",
  Content = "Content",
}

export type CTFBuiltInStyles =
  | "cfHorizontalAlignment"
  | "cfVerticalAlignment"
  | "cfMargin"
  | "cfPadding"
  | "cfBackgroundColor"
  | "cfWidth"
  | "cfMaxWidth"
  | "cfHeight"
  | "cfFlexDirection"
  | "cfFlexWrap"
  | "cfBorder"
  | "cfGap"
  | "cfImageAsset"
  | "cfImageOptions"
  | "cfBackgroundImageUrl"
  | "cfBackgroundImageOptions"
  | "cfFontSize"
  | "cfFontWeight"
  | "cfLineHeight"
  | "cfLetterSpacing"
  | "cfTextColor"
  | "cfTextAlign"
  | "cfTextTransform"
  | "cfTextBold"
  | "cfTextItalic"
  | "cfTextUnderline";
