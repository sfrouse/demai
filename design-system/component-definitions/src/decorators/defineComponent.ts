import { CTFBuiltInStyles } from "../types";

export type DefineComponentArgs = {
  figmaComponent?: string;
  import?: string;
  examples?: DefineComponentExample[];

  slots?: DefineComponentSlot[];
  hiddenProperties?: string[];
  designProperties?: DefineComponentDesignProperty[];

  contentful?: {
    builtInStyles?: CTFBuiltInStyles[];
  };
};

type DefineComponentSlot = {
  label: string;
  property: string;
  defaultSlot?: boolean;
};

type DefineComponentDesignProperty = {
  property: CDefDesignProperty;
  options?: { [key: string]: string };
  default?: string;
};

export enum CDefDesignProperty {
  BACKGROUND_COLOR = "_backgroundColor",
  TEXT_COLOR = "_textColor",
  CORNER_RADIUS = "_cornerRadius",
  PADDING = "_padding",
  // MARGIN = '_margin', // NOT UNIVERSAL

  GAP = "_gap",
  LAYOUT_DIRECTION = "_layoutDirection",
  ALIGN_ITEMS = "_alignItems",
  JUSTIFY_CONTENT = "_justifyContent",
  SELF_ALIGNMENT = "_selfAlignment",
  HORIZONTAL_RESIZING = "_horizontalResizing",
  VERTICAL_RESIZING = "_verticalResizing",
  HORIZONTAL_FLEX_GROW = "_horizontalFlexGrow",
  VERTICAL_FLEX_GROW = "_verticalFlexGrow",
  WIDTH = "_width",
  HEIGHT = "_height",
  // FLEX_GROW = '_flexGrow',
  // FLEX_SHRINK = '_flexShrink',
  // FLEX_BASIS = '_flexBasis',

  BORDER = "_border",
  BORDER_COLOR = "_borderColor",
  BORDER_WIDTH = "_borderWidth",
  BORDER_STYLE = "_borderStyle",

  FONT = "_font",
  FONT_FAMILY = "_fontFamily",
  FONT_WEIGHT = "_fontWeight",
  FONT_LINE_HEIGHT = "_fontLineHeight",
  FONT_SIZE = "_fontSize",
}

type DefineComponentExample = {
  name: string;
  path: string;
  description?: string;
};

// Just Used For Typing
export default function defineComponent(
  name: string,
  args?: DefineComponentArgs
): any | void {}
