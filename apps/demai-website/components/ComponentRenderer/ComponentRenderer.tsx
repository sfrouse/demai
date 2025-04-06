"use client";

import { SpaceParams } from "@/app/types";
import { Entry } from "contentful";
import reactComponentMappings, {
  ReactContentTypeId,
} from "@/controllers/reactComponents";
import { STUDIO_EXPERIENCE_CONTENT_TYPE } from "@/constants/global";
import Studio from "../Studio/Studio";
import { Experience as NinetailedExperience } from "@ninetailed/experience.js-react";
import { parseExperiences } from "../Ninetailed/utils/parseExperiences";
import ControllerRenderer from "../ControllerRenderer/ControllerRenderer";

export default function ComponentRenderer({
  params,
  entry,
}: {
  params: SpaceParams;
  entry: Entry<any> | null;
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

  if (entry.sys.contentType.sys.id === "demai-controller") {
    return (
      <NinetailedExperience
        id={entry.sys.id}
        {...entry}
        component={(props: any) => <ControllerRenderer controller={props} />}
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
  return (
    <div>
      <pre
        style={{
          overflow: "auto",
          fontSize: 10,
          maxHeight: 500,
        }}
      >
        {JSON.stringify(entry, null, 2)}
      </pre>
    </div>
  );
}
