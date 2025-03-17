"use client";

import { ContentfulLivePreview } from "@contentful/live-preview";
import { Entry } from "contentful";
import React from "react";
import { SpaceParams } from "@/app/types";
import { createElement } from "@lit-labs/ssr-react";
import entryToAttrsViaBindings from "@/controllers/webComponents/bindings/utils/entryToAttrsViaBindings";
import { findViewBindings } from "@/controllers/webComponents/bindings/utils/findBindings";
import renderBindingSlots from "@/controllers/webComponents/bindings/utils/renderBindingSlots";
import findBindingEntryReplacements from "@/controllers/webComponents/bindings/utils/findBindingEntryReplacements";
import ComponentRenderer from "../ComponentRenderer/ComponentRenderer";

export interface WebComponentProps {
  entry: Entry<any>;
  webComp?: string;
  slot?: string;
  attrs?: { [key: string]: any }; // not sure what this is for...
  params: SpaceParams;
}

export const WebComponent: React.FC<WebComponentProps> = (
  props: WebComponentProps
) => {
  const { entry, webComp, slot, params } = props;

  if (!entry) {
    return <div>No entry found</div>;
  }

  const bindingKey = entry?.sys?.contentType.sys.id;
  const viewBindings = findViewBindings(bindingKey, webComp);
  if (!viewBindings) {
    console.log(`no bindings found for ${bindingKey}`);
    return;
  }
  const replacement = findBindingEntryReplacements(entry, viewBindings);
  if (replacement) {
    return (
      <ComponentRenderer
        key={`wc-${replacement.sys.id}`}
        entry={replacement}
        webComp={viewBindings.id}
        attrs={{} /*finalAttrs*/}
        slot={slot}
        params={params}
      />
    );
  }

  const bindingAttrs = entryToAttrsViaBindings(entry, viewBindings, params);
  const bindingChildren = renderBindingSlots(entry, viewBindings, params);
  return createElement(
    viewBindings.id,
    {
      ...bindingAttrs,
      slot: slot === "default" ? undefined : slot,
      suppressHydrationWarning: true,
      ...ContentfulLivePreview.getProps({
        entryId: entry.sys.id,
        fieldId: Object.keys(entry.fields)[0],
      }),
    },
    bindingChildren
  );
};

WebComponent.displayName = "WebComponent";
