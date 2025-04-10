import { DEMAI_SYSTEM_PROPERTY_IDENTIFIER } from "../../../../../constants";

export const DEMAI_CONTROLLER_CTYPE_ID = "demai-controller";
export const DEMAI_CONTROLLER_DISPLAY_FIELD = "title";
export const DEMAI_CONTROLLER_EXPECTED_FIELDS = [
  {
    id: "title",
    name: "Title",
    type: "Symbol",
    localized: false,
    required: true,
    validations: [],
    disabled: false,
    omitted: false,
  },
  {
    id: "slug",
    name: "Slug",
    type: "Symbol",
    localized: false,
    required: true,
    validations: [
      {
        unique: true,
      },
    ],
    disabled: false,
    omitted: false,
  },
  {
    id: "description",
    name: "Description",
    type: "Text",
    localized: false,
    required: false,
    validations: [],
    disabled: false,
    omitted: false,
  },
  {
    id: "view",
    name: "View",
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
    name: "Model Bindings",
    type: "Array",
    localized: false,
    required: false,
    validations: [],
    disabled: false,
    omitted: false,
    items: {
      type: "Link",
      validations: [
        {
          linkContentType: ["demai-binding"],
        },
      ],
      linkType: "Entry",
    },
  },
  {
    id: "children",
    name: "Children",
    type: "Array",
    localized: false,
    required: false,
    validations: [],
    disabled: false,
    omitted: false,
    items: {
      type: "Link",
      validations: [
        {
          linkContentType: ["demai-controller"],
        },
      ],
      linkType: "Entry",
    },
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
