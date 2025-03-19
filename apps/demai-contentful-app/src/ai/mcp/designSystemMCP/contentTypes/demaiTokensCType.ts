export const DEMAI_TOKENS_CTYPE_ID = "demai-tokens";
export const DEMAI_TOKENS_DISPLAY_FIELD = "title";
export const DEMAI_TOKENS_SINGLETON_ENTRY_ID = "demai-tokens-entry";
export const DEMAI_TOKENS_EXPECTED_FIELDS = [
  {
    id: "title",
    name: "Title",
    type: "Symbol",
    required: true,
    localized: false,
  },
  {
    id: "source",
    name: "Source",
    type: "Object",
    required: false,
    localized: false,
  },
  {
    id: "json",
    name: "JSON",
    type: "Object",
    required: false,
    localized: false,
  },
  {
    id: "jsonNested",
    name: "JSON Nested",
    type: "Object",
    required: false,
    localized: false,
  },
  {
    id: "ai",
    name: "AI",
    type: "Text",
    required: false,
    localized: false,
  },
  {
    id: "css",
    name: "CSS",
    type: "Text",
    required: false,
    localized: false,
  },
  {
    id: "scss",
    name: "SCSS",
    type: "Text",
    required: false,
    localized: false,
  },
  {
    id: "contentfulTokens",
    name: "Contentful Tokens",
    type: "Text",
    required: false,
    localized: false,
  },
];
