export const DEMAI_BINDING_CTYPE_ID = "demai-binding";
export const DEMAI_BINDING_DISPLAY_FIELD = "title";
export const DEMAI_BINDING_EXPECTED_FIELDS = [
  {
    id: "title",
    name: "Title",
    type: "Symbol",
    localized: false,
    required: false,
    validations: [],
    disabled: false,
    omitted: false,
  },
  {
    id: "model",
    name: "Model",
    type: "Link",
    localized: false,
    required: false,
    validations: [],
    disabled: false,
    omitted: false,
    linkType: "Entry",
  },
  {
    id: "bindings",
    name: "Bindings",
    type: "Object",
    localized: false,
    required: false,
    validations: [],
    disabled: false,
    omitted: false,
  },
];
