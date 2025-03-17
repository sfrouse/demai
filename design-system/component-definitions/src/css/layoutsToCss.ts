import { CDefDesignProperty } from "../decorators/defineComponent";
import { CDefLayout } from "../types";

export default function layoutsToCss(
    htmlElement: HTMLElement
) {
    const styles: string[] = [];
    const parentLayout = htmlElement.parentElement?.getAttribute('_layoutDirection') || CDefLayout.NONE;
    const horizontalResizing = htmlElement.getAttribute('_horizontalResizing') || 'fill';
    const verticalResizing = htmlElement.getAttribute('_verticalResizing') || 'fill';

    if (horizontalResizing === 'hug') {
        if (parentLayout === CDefLayout.NONE) {
            styles.push('display: inline-flex;');
        }else if (parentLayout === CDefLayout.COLUMN) {
            // styles.push('align-self: flex-start;');
        }
    }else if (horizontalResizing === 'fixed') {
        styles.push(`width: ${htmlElement.getAttribute('_width')};`)
    }else if (horizontalResizing === 'fill') {
        if (parentLayout === CDefLayout.NONE) {
            styles.push('width: 100%; box-sizing: border-box; /* horizontalResizing = fill && parentLayout = none */');
        }else if (parentLayout === CDefLayout.COLUMN) {
            styles.push(`align-self: stretch; /* horizontalResizing = fill && parentLayout = column */`);
        }else if (parentLayout === CDefLayout.ROW) {
            const horizontalFlex = htmlElement.getAttribute('_horizontalFlexGrow') || '1';
            styles.push(`flex: ${horizontalFlex};  /* horizontalResizing = fill && parentLayout = row */`);
        }
    }
    
    if (verticalResizing === 'hug') {
        if (parentLayout === CDefLayout.NONE) {
        }else if (parentLayout === CDefLayout.COLUMN) {
            styles.push(`flex: 0;`);
        }else if (parentLayout === CDefLayout.ROW) {
            // styles.push(`align-self: flex-start;`);
        }
    }else if (verticalResizing === 'fixed') {
        styles.push(`height: ${htmlElement.getAttribute('_height')};`)
    }else if (verticalResizing === 'fill') {
        if (parentLayout === CDefLayout.NONE) {
            // styles.push('display: inline-flex;');
        }else if (parentLayout === CDefLayout.COLUMN) {
            const verticalFlex = htmlElement.getAttribute('_verticalFlexGrow') || '1';
            styles.push(`flex: ${verticalFlex};`);
        }else if (parentLayout === CDefLayout.ROW) {
            styles.push(`align-self: stretch;`);
        }
    }

    return styles.join('\n');
}

export const layoutDesignProps = [
    {
        property: CDefDesignProperty.HORIZONTAL_RESIZING,
        options: {
          'Fixed': 'fixed',
          'Fill': 'fill',
          'Hug': 'hug'
        },
        default: 'hug'
      },
      {
        property: CDefDesignProperty.WIDTH,
      },
      {
        property: CDefDesignProperty.HORIZONTAL_FLEX_GROW,
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
      },
      {
        property: CDefDesignProperty.VERTICAL_RESIZING,
        options: {
          'Fixed': 'fixed',
          'Fill': 'fill',
          'Hug': 'hug'
        },
        default: 'hug'
      },
      {
        property: CDefDesignProperty.HEIGHT,
      },
      {
        property: CDefDesignProperty.VERTICAL_FLEX_GROW,
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
]