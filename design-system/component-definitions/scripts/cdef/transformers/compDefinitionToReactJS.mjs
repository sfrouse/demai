export default function compDefitionToReact(cdef, className) {
    if (!cdef) return "";
    const xCDef = cdef["x-cdef"];
    if (!xCDef) return "";
    const tag = xCDef.tag || cdef.$id;

    const props = [];
    const attributes = [];
    const reactAttrs = [];
    let isRichText = false;
    let isSlotted = false;

    if (cdef.properties) {
        Object.entries(cdef.properties).forEach(([name, property]) => {
            if (["$schema", "$identifier"].includes(name)) return;
            const xCDef = property["x-cdef"];
            if (xCDef.hidden === true) return;
            if (xCDef.output?.webComponent?.slot === true) {
                isSlotted = true;
                return;
            }
            if (xCDef.input?.options) {
                props.push(`${name}: "${property.enum.join('" | "')}"`);
            } else {
                const jsType = cdefTypeToJavaScriptType(xCDef.input.inputType);
                props.push(`${name}: ${jsType}`);
            }

            isRichText = xCDef.input.inputType === "richText";
            if (isRichText) {
                attributes.push(`${name}={documentToHtmlString(props.${name})}`);
                reactAttrs.push(`${name}: documentToHtmlString(props.${name})`);
            } else {
                attributes.push(`${name}={props.${name}}`);
                reactAttrs.push(`${name}: props.${name}`);
            }
        });
    }

    return `/* eslint-disable */
/**
 * THIS FILE IS AUTOGENERATED. DO NOT EDIT THIS FILE DIRECTLY.
 * Any changes made here will be overwritten during the next build.
 * 
 * Generated on: ${new Date().toISOString().split("T")[0]}
 */
// import React from 'react';
import { createElement } from "@lit-labs/ssr-react";${isRichText ? `\nimport { documentToHtmlString } from "@contentful/rich-text-html-renderer";` : ""}

const ${className} = (props) => {
    const attrs = {
        ${reactAttrs.join(",\n        ")}
    };

    const filteredProps = Object.entries(attrs).reduce((acc, [key, value]) => {
        if (value !== undefined) {
            acc[key] = value;
        }
        return acc;
    }, {});

    return createElement(
        "${tag}",
        {
            suppressHydrationWarning: true,
            ...filteredProps
        }${isSlotted ? `,\n        props.children` : ""}
    );
};

export default ${className};
`;

}

function cdefTypeToJavaScriptType(cdefType) {
    switch (cdefType) {
        case "string":
        case "richText":
            return "''";
        case "boolean":
            return "false";
        case "number":
            return "0";
        default:
            return "''";
    }
}