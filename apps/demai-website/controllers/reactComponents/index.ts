import SimpleReactView from "@/components/SimpleReactView/SimpleReactView";
import { Entry } from "contentful";
import React from "react";

const reactComponentMappings: Record<
  string,
  // eslint-disable-next-line no-unused-vars
  ({ entry }: { entry: Entry<any> }) => React.JSX.Element | null
> = {
  ["simpleReactView"]: SimpleReactView,
} as const;

export type ReactComponentMappings = typeof reactComponentMappings;
export type ReactContentTypeId = keyof ReactComponentMappings;
export default reactComponentMappings;
