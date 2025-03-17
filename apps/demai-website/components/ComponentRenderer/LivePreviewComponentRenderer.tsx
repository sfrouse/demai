"use client";

import React from "react";
import {
  ContentfulLivePreviewProvider,
  useContentfulLiveUpdates,
} from "@contentful/live-preview/react";
import ComponentRenderer from "../ComponentRenderer/ComponentRenderer";
import { WebComponentProps } from "../WebComponent/WebComponent";

export const LivePreviewComponentRenderer: React.FC<WebComponentProps> = (
  props
) => {
  const { entry, params } = props;

  // Wrap live preview updates
  const modifiedEntry = useContentfulLiveUpdates(entry);

  return (
    <ContentfulLivePreviewProvider locale={params.locale} debugMode={false}>
      <ComponentRenderer entry={modifiedEntry} params={params} />
    </ContentfulLivePreviewProvider>
  );
};
