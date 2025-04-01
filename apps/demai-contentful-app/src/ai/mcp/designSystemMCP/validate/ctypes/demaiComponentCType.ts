export const DEMAI_COMPONENT_CTYPE_ID = "demai-component";
export const DEMAI_COMPONENT_DISPLAY_FIELD = "title";
export const DEMAI_COMPONENT_EXPECTED_FIELDS = [
  {
    id: "title",
    name: "Title",
    type: "Symbol",
    localized: false,
    required: true,
  },
  {
    id: "description",
    name: "Description",
    type: "Symbol",
    localized: false,
    required: true,
  },
  {
    id: "componentDefinition",
    name: "Definition",
    type: "Object",
    localized: false,
    required: false,
  },
  {
    id: "javascript",
    name: "Javascript",
    type: "Text",
    localized: false,
    required: false,
  },
  {
    id: "bindings",
    name: "Bindings",
    type: "Object",
    localized: false,
    required: false,
  },
];
