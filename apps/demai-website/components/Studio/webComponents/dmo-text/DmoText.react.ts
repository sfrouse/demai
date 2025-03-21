/* eslint-disable */
// @ts-nocheck
/**
 * THIS FILE IS AUTOGENERATED. DO NOT EDIT THIS FILE DIRECTLY.
 * Any changes made here will be overwritten during the next build.
 * 
 * Generated on: 2025-03-17
 */
import React, { useEffect, useRef } from 'react';
import { createElement } from "@lit-labs/ssr-react";


interface DmoTextProps {
    _textColor: "dmai_text_default" | "dmai_text_subdued" | "dmai_text_minimal" | "dmai_text_inverted" | "dmai_text_warning" | "dmai_text_danger" | "dmai_text_primary_default" | "dmai_text_primary_inverted" | "dmai_text_secondary_default" | "dmai_text_tertiary_default" | "dmai_text_tertiary_inverted" | "dmai_text_on_surface_default" | "dmai_text_secondary_inverted" | "dmai_text_on_surface_subdued" | "dmai_text_on_surface_minimal" | undefined,
	_horizontalResizing: "fixed" | "fill" | "hug" | undefined,
	_width: string,
	_horizontalFlexGrow: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | undefined,
	_verticalResizing: "fixed" | "fill" | "hug" | undefined,
	_height: string,
	_verticalFlexGrow: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | undefined,
	title: string,
	type: "display-md" | "heading-xl" | "heading-lg" | "heading-md" | "heading-sm" | "heading-xs" | "body-lg" | "body-md" | "body-sm" | "label-lg" | "label-md" | "label-sm" | "label-xs" | undefined,
	text: string,
}

const DmoText: React.FC<DmoTextProps> = (props) => {
    /* return <dmo-text
        _textColor={props._textColor}
		_horizontalResizing={props._horizontalResizing}
		_width={props._width}
		_horizontalFlexGrow={props._horizontalFlexGrow}
		_verticalResizing={props._verticalResizing}
		_height={props._height}
		_verticalFlexGrow={props._verticalFlexGrow}
		title={props.title}
		type={props.type}
		text={props.text}>
        </dmo-text>;*/

    const attrs = {
        _textColor:props._textColor,
            _horizontalResizing:props._horizontalResizing,
            _width:props._width,
            _horizontalFlexGrow:props._horizontalFlexGrow,
            _verticalResizing:props._verticalResizing,
            _height:props._height,
            _verticalFlexGrow:props._verticalFlexGrow,
            title:props.title,
            type:props.type,
            text:props.text
    };

    const filteredProps = Object.entries(attrs).reduce((acc, [key, value]) => {
        if (value !== undefined) {
            acc[key] = value;
        }
        return acc;
    }, {});

    return createElement(
        "dmo-text",
        {
            suppressHydrationWarning: true,
            ...filteredProps
        },
    );
};

export default DmoText;

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'dmo-text': React.DetailedHTMLProps<
                React.HTMLAttributes<HTMLElement>,
                Partial<DmoTextProps>,
                HTMLElement
            >
        }
    }
}