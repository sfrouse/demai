const PRIMITIVES_COLLECTION = 'primitives';
const SEMANTIC_COLOR_COLLECTION = 'semantic color';
const SEMANTIC_TYPE_COLLECTION = 'semantic type';
const SEMANTIC_SPACING_COLLECTION = 'semantic spacing';

const TOKEN_SPACE_PREFIX = 'spacing/';
const TOKEN_BACKGROUND_PREFIX = 'background/';
const TOKEN_BORDER_PREFIX = 'border/';
const TOKEN_BORDER_RADIUS_SUFFIX = 'border/radius/';
const TOKEN_TEXT_PREFIX = 'text/';
const TOKEN_TEXT_SIZE_PREFIX = '/size';
const TOKEN_TEXT_LINE_HEIGHT_PREFIX = '/lineheight';

const COLOR_IGNORE_LIST = ['hover', 'pressed', 'disabled', 'selected'];
const COLOR_ROLE_IGNORE_LIST = ['background', 'text', 'border', 'icon', 'surface'];

const ALIAS_LOOKUP = 'ALIAS:';
const ALIAS_SEPERATOR = '||';

export {
    PRIMITIVES_COLLECTION,
    SEMANTIC_COLOR_COLLECTION,
    SEMANTIC_TYPE_COLLECTION,
    SEMANTIC_SPACING_COLLECTION,
    
    TOKEN_SPACE_PREFIX,
    TOKEN_BACKGROUND_PREFIX,
    TOKEN_BORDER_PREFIX,
    TOKEN_BORDER_RADIUS_SUFFIX,
    TOKEN_TEXT_PREFIX,
    TOKEN_TEXT_SIZE_PREFIX,
    TOKEN_TEXT_LINE_HEIGHT_PREFIX,
    
    COLOR_IGNORE_LIST,
    COLOR_ROLE_IGNORE_LIST,

    ALIAS_LOOKUP,
    ALIAS_SEPERATOR
};