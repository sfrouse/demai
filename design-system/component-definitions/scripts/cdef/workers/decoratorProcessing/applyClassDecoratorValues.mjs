

export default function applyClassDecoratorValues(
    decoratorResults, compDefinition
) {

    if (!decoratorResults) return;

    decoratorResults.hiddenProperties?.map(hiddenProp => {
        compDefinition.properties[hiddenProp] = {
            $schema: "https://json-schema.org/draft-07/schema",
            title: hiddenProp,
            type: "string",
            "x-cdef": {
              input: {
                inputType: "string",
                label: hiddenProp
              },
              output: {
                webComponent: {
                  attribute: hiddenProp
                }
              },
              hidden: true
            }
        }
    });

    decoratorResults.designProperties?.map(designProp => {
      if (
        // !designProp.options ||
        !designProp.property
      ) {
        console.log("designProp malformed", designProp);
        return;
      }
      let prop = {
        label: "Unknown",
        description: "design property",
        inputType: 'string',
        cssProperty: 'Unknown',
        figmaProperty: 'Unknown',
      }
      if (designProp.property === '_backgroundColor') {
        prop = {
          label: "Background Color",
          description: "Specifies the background color for the component, allowing selection from a predefined set of design tokens.",
          inputType: 'color',
          cssProperty: 'background-color',
          figmaProperty: 'backgroundColor',
        }
      }
      if (designProp.property === '_textColor') {
        prop = {
          label: "Text Color",
          description: "Specifies the text color for the component, allowing selection from a predefined set of design tokens.",
          inputType: 'color',
          cssProperty: 'color',
          figmaProperty: 'textColor',
        }
      }
      if (designProp.property === '_cornerRadius') {
        prop = {
          label: "Corner Radius",
          description: "Specifies the corner radius of the component, called border-radius in css.",
          inputType: 'number',
          cssProperty: 'border-radius',
          figmaProperty: 'cornerRadius',
        }
      }
      if (designProp.property === '_padding') {
        prop = {
          label: "Padding",
          description: "Specifies the padding of this component, allowing selection from a predefined set of design tokens.",
          inputType: 'string', // allows for array overloading
          cssProperty: 'padding',
          figmaProperty: 'padding',
        }
      }

      // LAYOUT
      if (designProp.property === '_gap') {
        prop = {
          label: "Gap",
          inputType: 'string', // allows for array overloading
          cssProperty: 'gap',
          figmaProperty: 'gap',
        }
      }
      if (designProp.property === '_layoutDirection') {
        prop = {
          label: "Layout Direction",
          description: "This component controls how it's children get rendered. This property determines the direction. This is simiar to flex-direction in css.",
          inputType: 'string',
          cssProperty: 'flex-direction',
          figmaProperty: 'autoLayoutDirection',
          options: {
            'Horizontal': 'row',
            'Vertical': 'column',
            // 'Horizontal Reversed': 'row-reverse',
            // 'Vertical Reversed': 'column-reverse'
          },
          default: 'column'
        }
      }
      if (designProp.property === '_alignItems') {
        prop = {
          label: "Align Items",
          inputType: 'string',
          cssProperty: 'align-items',
          figmaProperty: 'counterAxisAlignContent',
          options: {
            'Start': 'start',
            'Center': 'center',
            'End': 'end',
            'Stretch': 'stretch'
          },
          default: 'start'
        }
      }
      if (designProp.property === '_justifyContent') {
        prop = {
          label: "Justify Content",
          inputType: 'string',
          cssProperty: 'justify-content',
          figmaProperty: 'primaryAxisAlignItems',
          options: {
            'Start': 'start',
            'Center': 'center',
            'End': 'end',
            'Space Between': 'space-between'
          },
          default: 'start'
        }
      }
      if (designProp.property === '_verticalResizing') {
        prop = {
          label: "Vertical Resizing",
          description: "This is shortcut for figuring out how this component should resize vertically. Fixed means that the height property will be used (height is ignored otherwise), hug means it will hug it's children and take the height of the children combined, and fill is like stretch in that it will try to fill whatever space is available in it's parent.",
          inputType: 'string',
          cssProperty: '--vertical-resizing',
          figmaProperty: 'layoutSizingVertical',
          options: {
            'Fixed': 'fixed',
            'Fill': 'fill',
            'Hug': 'hug'
          },
          default: 'hug'
        }
      }
      if (designProp.property === '_horizontalResizing') {
        prop = {
          label: "Horizontal Resizing",
          description: "This is shortcut for figuring out how this component should resize horizontally. Fixed means that the width property will be used (width is ignored otherwise), hug means it will hug it's children and take the width of the children combined, and fill is like stretch in that it will try to fill whatever space is available in it's parent.",
          inputType: 'string',
          cssProperty: '--horizontal-resizing',
          figmaProperty: 'layoutSizingHorizontal',
          options: {
            'Fixed': 'fixed',
            'Fill': 'fill',
            'Hug': 'hug'
          },
          default: 'hug'
        }
      }
      if (designProp.property === '_width') {
        prop = {
          label: "Width",
          description: "The hardcoded width of the component. It only accepts pixels right now. It is only valid with _horizontalResizing set to 'fixed'",
          inputType: 'string',
          cssProperty: 'width',
          figmaProperty: 'width',
        }
      }
      if (designProp.property === '_height') {
        prop = {
          label: "Height",
          description: "The hardcoded height of the component. It only accepts pixels right now. It is only valid with _verticalResizing set to 'fixed'",
          inputType: 'string',
          cssProperty: 'height',
          figmaProperty: 'height',
        }
      }
      if (designProp.property === '_verticalFlexGrow') {
        prop = {
          label: "Vertical Flex",
          description: "A shortcut for figuring how the component should fill it's space if it's parent is flex-direction column. It is flex in css.",
          inputType: 'string',
          cssProperty: '--vertical-flex-grow',
          figmaProperty: 'verticalFlexGrow',
          options: {
            '1': '1',
            '2': '2',
            '3': '3',
            '4': '4',
            '5': '5',
            '6': '6',
            '7': '7',
            '8': '8',
            '9': '9',
            '10': '10',
            '11': '11',
            '12': '12'
          }
        }
      }
      if (designProp.property === '_horizontalFlexGrow') {
        prop = {
          label: "Horizontal Flex",
          description: "A shortcut for figuring how the component should fill it's space if it's parent is flex-direction row. It is flex in css.",
          inputType: 'string',
          cssProperty: '--horizontal-flex-grow',
          figmaProperty: 'horizontalFlexGrow',
          options: {
            '1': '1',
            '2': '2',
            '3': '3',
            '4': '4',
            '5': '5',
            '6': '6',
            '7': '7',
            '8': '8',
            '9': '9',
            '10': '10',
            '11': '11',
            '12': '12'
          }
        }
      }
      // if (designProp.property === '_flexGrow') {
      //   prop = {
      //     label: "Flex Grow",
      //     inputType: 'string',
      //     cssProperty: 'flex-grow',
      //     figmaProperty: 'autoLayoutFlexGrow',
      //   }
      // }
      // if (designProp.property === '_flexShrink') {
      //   prop = {
      //     label: "Flex Shrink",
      //     inputType: 'string',
      //     cssProperty: 'flex-shrink',
      //     figmaProperty: 'autoLayoutFlexShrink',
      //   }
      // }
      // if (designProp.property === '_flexBasis') {
      //   prop = {
      //     label: "Flex Basis",
      //     inputType: 'string',
      //     cssProperty: 'flex-basis',
      //     figmaProperty: 'autoLayoutFlexBasis',
      //   }
      // }

      // BORDER
      if (designProp.property === '_border') {
        prop = {
          label: "Border",
          inputType: 'string',
          cssProperty: 'border',
          figmaProperty: 'style:border',
        }
      }
      if (designProp.property === '_borderColor') {
        prop = {
          label: "Border Color",
          inputType: 'color',
          cssProperty: 'border-color',
          figmaProperty: 'borderColor',
        }
      }
      if (designProp.property === '_borderWidth') {
        prop = {
          label: "Border Width",
          inputType: 'number',
          cssProperty: 'border-width',
          figmaProperty: 'borderWidth',
        }
      }
      if (designProp.property === '_borderStyle') {
        prop = {
          label: "Border Style",
          inputType: 'string',
          cssProperty: 'border-style',
          figmaProperty: 'borderStyle',
          options: {
            'None': 'none',
            'Solid': 'solid',
            'Dashed': 'dashed'
          },
          default: 'none'
        }
      }
      if (designProp.property === '_fontFamily') {
        prop = {
          label: "Font Family",
          inputType: 'string',
          cssProperty: 'font-family',
          figmaProperty: 'fontFamily',
        }
      }
      if (designProp.property === '_fontWeight') {
        prop = {
          label: "Font Weight",
          inputType: 'string',
          cssProperty: 'font-weight',
          figmaProperty: 'fontWeight',
        }
      }

      // TYPOGRAPHY
      if (designProp.property === '_font') {
        prop = {
          label: "Font",
          inputType: 'string',
          cssProperty: 'font',
          figmaProperty: 'font',
        }
      }

      const propertyDef = {
          $schema: "https://json-schema.org/draft-07/schema",
          title: prop.label,
          description: prop.description,
          type: 'string',
          "x-cdef": {
            design: true,
            input: {
              inputType: 'string',
              label: prop.label,
              defaultValue: prop.default || designProp.default
            },
            output: {
              figma: {
                property: prop.figmaProperty,
              },
              webComponent: {
                cssProperty: prop.cssProperty,
              }
            }
          }
      }
      if (prop.options) {
        propertyDef.enum = Object.values(prop.options);
        propertyDef["x-cdef"].input.options = prop.options;
        propertyDef["x-cdef"].input.inputType = 'select';
      } else if (designProp.options) {
        propertyDef.enum = Object.values(designProp.options);
        propertyDef["x-cdef"].input.options = designProp.options;
        propertyDef["x-cdef"].input.inputType = 'select';
      }
      compDefinition.properties[designProp.property] = propertyDef;
    });

    decoratorResults.slots?.map(slot => {
        if (!slot.label || !slot.property) {
            console.log("Slot malformed", slot);
            return;
        }
        compDefinition.properties[slot.property] = {
            $schema: "https://json-schema.org/draft-07/schema",
            title: slot.label,
            type: "array",
            "x-cdef": {
              input: {
                inputType: "array",
                label: slot.label
              },
              output: {
                content: {
                  content: true,
                },
                webComponent: {
                  attribute: slot.property,
                  slot: true,
                  defaultSlot: slot.defaultSlot === true ? true : undefined
                }
              }
            }
        }
    });

    decoratorResults.examples?.map(example => {
        compDefinition['x-cdef'].examples = compDefinition['x-cdef'].examples || [];
        compDefinition['x-cdef'].examples.push(
            example
        )
    });

    if (decoratorResults.figmaComponent) {
        compDefinition['x-cdef'].figma = {
            component: decoratorResults.figmaComponent
        }
    }

    if (decoratorResults.name) {
      compDefinition['x-cdef'].name = decoratorResults.name;
    }

    if (decoratorResults.import) {
      compDefinition['x-cdef'].import = decoratorResults.import;
    }

    if (decoratorResults.contentful?.builtInStyles) {
      compDefinition['x-cdef'].content = {
        ...compDefinition['x-cdef'].content,
        contentfulBuiltInStyles: decoratorResults.contentful.builtInStyles
      }
    }
}