import {
  detachExperienceStyles,
  fetchBySlug,
} from "@contentful/experiences-sdk-react";
import React from "react";
import { STUDIO_EXPERIENCE_CONTENT_TYPE } from "@/constants/global";
import { SpaceParams } from "@/app/types";
import getContentfulClient from "@/lib/getContentfulClient";
import { StudioExperienceRoot } from "./StudioExperienceRoot";
import registerComponents from "./webComponents/register-studio-components";
registerComponents();

export const StudioServer: React.FC<{
  params: SpaceParams;
}> = async ({ params }: { params: SpaceParams }) => {
  const client = await getContentfulClient(
    params.spaceId,
    params.cda,
    params.cpa,
    params.environment,
    params.preview
  );
  if (!client) return null;

  let studioPage,
    studioPageStyles = "";
  try {
    studioPage = await fetchBySlug({
      client,
      slug: params.slug,
      experienceTypeId: STUDIO_EXPERIENCE_CONTENT_TYPE,
      localeCode: params.locale,
    });
    studioPageStyles = studioPage
      ? detachExperienceStyles(studioPage) || ""
      : "";
  } catch (e) {
    //nada
  }

  return (
    <>
      {studioPage ? (
        <StudioExperienceRoot
          locale={params.locale}
          experience={JSON.stringify(studioPage)}
          experienceStyles={studioPageStyles}
        />
      ) : null}
    </>
  );
};
