"use client";

import { SpaceParams } from "@/app/types";
import { Entry } from "contentful";
import reactComponentMappings, {
  ReactContentTypeId,
} from "@/controllers/reactComponents";
import { STUDIO_EXPERIENCE_CONTENT_TYPE } from "@/constants/global";
import Studio from "../Studio/Studio";
import { WebComponent } from "../WebComponent/WebComponent";
import { Experience as NinetailedExperience } from "@ninetailed/experience.js-react";
import { createElement } from "@lit-labs/ssr-react";
import { parseExperiences } from "../Ninetailed/utils/parseExperiences";
import findBindings from "@/controllers/webComponents/bindings/utils/findBindings";

export default function ComponentRenderer({
  params,
  entry,
  webComp,
  attrs,
  slot,
}: {
  params: SpaceParams;
  entry: Entry<any> | null;
  webComp?: string;
  attrs?: { [key: string]: any };
  slot?: string;
}) {
  if (!entry) {
    return <div>No entry found</div>;
  }

  // 1) We know right away if it is Studio...
  if (entry.sys.contentType.sys.id === STUDIO_EXPERIENCE_CONTENT_TYPE) {
    return (
      <Studio
        params={{
          ...params,
          slug: `${
            // Live Preview is adding empty characters causing the query to fail
            decodeURIComponent(entry.fields.slug as string).match(
              /^[a-zA-Z0-9-]*/
            )?.[0] || ""
          }`,
        }}
      />
    );
  }

  const ninetailedEntries = parseExperiences(entry);

  // 2) Check if it is Web Component
  const webConfig = findBindings(entry?.sys?.contentType.sys.id);
  if (webConfig) {
    return (
      <NinetailedExperience
        id={entry.sys.id}
        {...entry}
        component={(props: any) => {
          return (
            <WebComponent
              key={`wc-${entry.sys.id}`}
              entry={{
                metadata: props.metadata,
                sys: props.sys,
                fields: props.fields,
              }}
              webComp={webComp}
              params={params}
              attrs={attrs}
              slot={slot}
            />
          );
        }}
        experiences={ninetailedEntries}
      />
    );
  }

  // 3) Finally check to see if it is a React View
  const reactComp =
    reactComponentMappings[
      entry?.sys?.contentType.sys.id as ReactContentTypeId
    ];
  if (reactComp) {
    return (
      <NinetailedExperience
        id={entry.sys.id}
        {...entry}
        component={(props: any) => {
          return reactComp({
            entry: {
              metadata: props.metadata,
              sys: props.sys,
              fields: props.fields,
            },
          });
        }}
        experiences={ninetailedEntries}
      />
    );
  }

  // None of the above...something to show what it is...
  console.log("DMO-ENTRY", entry?.sys?.contentType.sys.id);
  return createElement("dmo-entry", {
    entry: JSON.stringify(entry),
    suppressHydrationWarning: true,
  });
}
