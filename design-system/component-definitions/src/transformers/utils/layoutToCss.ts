import { CDefLayoutValue } from "../../types";
import uuid from "./uuid";


export default function layoutToCss(layout: CDefLayoutValue) : {
    css: string,
    cssId: string
} {
    const cssId = uuid();
    const cssArr = [
        `[data-layout-id='${cssId}'] {`,
    ];
    const rootCssArr = [
        'display: flex;'
    ];
    // TODO: start checking for data types...
    if (layout.padding) {
        rootCssArr.push(`padding: ${layout.padding.join('px ')}px;`);
    }
    if (layout.gap) {
        rootCssArr.push(`gap: ${layout.gap}px;`);
    }
    if (layout.direction === 'vertical') {
        rootCssArr.push(`flex-direction: column;`);
        if (layout.horizontalAlignment === 'right') {
            rootCssArr.push(`align-items: flex-end;`);
        }else if (layout.horizontalAlignment === 'center') {
            rootCssArr.push(`align-items: center;`);
        }else{
            rootCssArr.push(`align-items: flex-start;`);
        }
        if (layout.verticalAlignment === 'bottom') {
            rootCssArr.push(`justify-content: flex-end;`);
        }else if (layout.verticalAlignment === 'center') {
            rootCssArr.push(`justify-content: center;`);
        }else{
            rootCssArr.push(`justify-content: flex-start;`);
        }
    }else{
        rootCssArr.push(`flex-direction: row;`);
        if (layout.horizontalAlignment === 'right') {
            rootCssArr.push(`justify-content: flex-end;`);
        }else if (layout.horizontalAlignment === 'center') {
            rootCssArr.push(`justify-content: center;`);
        }else{
            rootCssArr.push(`justify-content: flex-start;`);
        }
        if (layout.verticalAlignment === 'bottom') {
            rootCssArr.push(`align-items: flex-end;`);
        }else if (layout.verticalAlignment === 'center') {
            rootCssArr.push(`align-items: center;`);
        }else{
            rootCssArr.push(`align-items: flex-start;`);
        }
    }

    if (layout.position === 'absolute') {
        rootCssArr.push(`position: absolute;`);
        rootCssArr.push(`top: 0; bottom: 0; left: 0; right: 0;`);
    }else{
        rootCssArr.push(`position: relative;`);
    }

    cssArr.push(`\t${rootCssArr.join('\n\t')}`);
    cssArr.push(`}`);

    // resizing (Figma centric)....
    cssArr.push(`
        ${(
            layout.horizontalResizing === undefined ||
            layout.horizontalResizing === 'fill'
        ) ? `
*:not([data-layout-direction]) > [data-layout-id='${cssId}'],
[data-layout-direction='horizontal'] > [data-layout-id='${cssId}'] {
    flex: ${layout.widthFill === undefined ? 1 : layout.widthFill};
}
[data-layout-direction='vertical'] > [data-layout-id='${cssId}'] {
    width: 100%;
    align-self: stretch;
}` : ''} 
        ${layout.horizontalResizing === 'fixed' ? `
[data-layout-id='${cssId}'] {
    width: ${
        layout.width === undefined ? 200 : layout.width}${
        layout.widthUnit === undefined ? 'px' : layout.widthUnit === 'percent' ? '%' : 'px'
    };
}` : ''}

        ${layout.verticalResizing === 'fill' ? `
[data-layout-direction='vertical'] > [data-layout-id='${cssId}'] {
    flex: ${layout.heightFill === undefined ? 1 : layout.heightFill};
}
*:not([data-layout-direction]) > [data-layout-id='${cssId}'],
[data-layout-direction='horizontal'] > [data-layout-id='${cssId}'] {
    height: 100%;
    align-self: stretch;
}` : ''} 
        ${layout.verticalResizing === 'fixed' ? `
[data-layout-id='${cssId}'] {
    height: ${
        layout.height === undefined ? 200 : layout.height}${
        layout.heightUnit === undefined ? 'px' : layout.heightUnit === 'percent' ? '%' : 'px'
    };
}` : ''}`);

    return {
        css: `${cssArr.join('\n')}`,
        cssId
    };
}

