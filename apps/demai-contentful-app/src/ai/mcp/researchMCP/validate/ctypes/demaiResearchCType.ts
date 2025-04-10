import { DEMAI_SYSTEM_PROPERTY_IDENTIFIER } from "../../../../../constants";

export const DEMAI_RESEARCH_CTYPE_ID = "demai-research";
export const DEMAI_RESEARCH_DISPLAY_FIELD = "title";
export const DEMAI_RESEARCH_SINGLETON_ENTRY_ID = "demai-research-entry";
export const DEMAI_RESEARCH_EXPECTED_FIELDS = [
  {
    id: "title",
    name: "Title",
    type: "Symbol",
    required: true,
    localized: false,
  },
  {
    id: "prospect",
    name: "Prospect",
    type: "Symbol",
    required: false,
    localized: false,
  },
  {
    id: "mainWebsite",
    name: "Main Website",
    type: "Symbol",
    required: false,
    localized: false,
  },
  {
    id: "solutionEngineerDescription",
    name: "Solution Engineer Description",
    type: "Text",
    required: false,
    localized: false,
  },
  {
    id: "primaryColor",
    name: "Primary Color",
    type: "Symbol",
    required: false,
    localized: false,
  },
  {
    id: "secondaryColor",
    name: "Secondary Color",
    type: "Symbol",
    required: false,
    localized: false,
  },
  {
    id: "tertiaryColor",
    name: "Tertiary Color",
    type: "Symbol",
    required: false,
    localized: false,
  },
  {
    id: "description",
    name: "Brand Description",
    type: "Text",
    required: false,
    localized: false,
  },
  {
    id: "products",
    name: "Brand Products",
    type: "Text",
    required: false,
    localized: false,
  },
  {
    id: "tone",
    name: "Tone and Style",
    type: "Text",
    required: false,
    localized: false,
  },
  {
    id: "style",
    name: "Style",
    type: "Text",
    required: false,
    localized: false,
  },
  {
    id: DEMAI_SYSTEM_PROPERTY_IDENTIFIER,
    name: DEMAI_SYSTEM_PROPERTY_IDENTIFIER,
    type: "Boolean",
    omitted: true,
    disabled: true,
    defaultValue: {
      "en-US": true,
    },
  },
];
