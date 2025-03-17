"use client";

import { ExperienceConfiguration } from "@ninetailed/experience.js-next";
// import NinetailedGoogleTagmanagerPlugin from "@ninetailed/experience.js-plugin-google-tagmanager";
import NinetailedInsightsPlugin from "@ninetailed/experience.js-plugin-insights";
import NinetailedPreviewPlugin from "@ninetailed/experience.js-plugin-preview";
import { NinetailedProvider } from "@ninetailed/experience.js-react";
import React from "react";

type Audience = {
  id: string;
  name: string;
  description?: string | undefined;
};

export default function Providers({
  ninetailed,
  children,
  spaceId,
  env,
}: {
  ninetailed?: {
    preview: {
      allExperiences: ExperienceConfiguration[];
      allAudiences: Audience[];
    };
  };
  children: React.ReactNode;
  spaceId: string;
  env: string;
}) {
  // TODO: add SpaceParams
  return (
    <NinetailedProvider
      clientId={process.env.NEXT_PUBLIC_NINETAILED_CLIENT_ID || ""}
      environment={process.env.NEXT_PUBLIC_NINETAILED_ENVIRONMENT || ""}
      plugins={[
        new NinetailedInsightsPlugin(),
        // new NinetailedGoogleTagmanagerPlugin(),
        new NinetailedPreviewPlugin({
          experiences: ninetailed?.preview.allExperiences || [],
          audiences: ninetailed?.preview.allAudiences || [],
          onOpenExperienceEditor: (experience) => {
            if (spaceId) {
              window.open(
                `https://app.contentful.com/spaces/${spaceId}/environments/${env}/entries/${experience.id}`,
                "_blank"
              );
            }
          },
          onOpenAudienceEditor: (audience) => {
            if (spaceId) {
              window.open(
                `https://app.contentful.com/spaces/${spaceId}/environments/${env}/entries/${audience.id}`,
                "_blank"
              );
            }
          },
        }),
      ]}
    >
      {children}
    </NinetailedProvider>
  );
}
