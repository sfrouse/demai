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


interface DMOButtonProps {
    emphasis: "bold" | "subtle" | "minimal" | undefined,
	design: "primary" | "secondary" | undefined,
	disabled: boolean,
	label: string,
	target: string,
	url: string,
}

const DMOButton: React.FC<DMOButtonProps> = (props) => {
    /* return <dmo-button
        emphasis={props.emphasis}
		design={props.design}
		disabled={props.disabled}
		label={props.label}
		target={props.target}
		url={props.url}>
        </dmo-button>;*/

    const attrs = {
        emphasis:props.emphasis,
            design:props.design,
            disabled:props.disabled,
            label:props.label,
            target:props.target,
            url:props.url
    };

    const filteredProps = Object.entries(attrs).reduce((acc, [key, value]) => {
        if (value !== undefined) {
            acc[key] = value;
        }
        return acc;
    }, {});

    return createElement(
        "dmo-button",
        {
            suppressHydrationWarning: true,
            ...filteredProps
        },
    );
};

export default DMOButton;

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'dmo-button': React.DetailedHTMLProps<
                React.HTMLAttributes<HTMLElement>,
                Partial<DMOButtonProps>,
                HTMLElement
            >
        }
    }
}