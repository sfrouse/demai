"use client";

import { ContentfulClientApi } from "contentful";
import {
  detachExperienceStyles,
  ExperienceRoot,
  useFetchBySlug,
} from "@contentful/experiences-sdk-react";
import getContentfulClient from "@/lib/getContentfulClient";
import { useEffect, useState, useMemo } from "react";
import { STUDIO_EXPERIENCE_CONTENT_TYPE } from "@/constants/global";
import { SpaceParams } from "@/app/types";
import registerComponents from "./webComponents/register-studio-components";
registerComponents();

export default function Studio({ params }: { params: SpaceParams }) {
  const [client, setClient] = useState<ContentfulClientApi<undefined> | false>(
    false
  );

  useEffect(() => {
    let isMounted = true;

    (async () => {
      const fetchedClient = await getContentfulClient(
        params.spaceId,
        params.cda,
        params.cpa,
        params.environment,
        params.preview
      );

      if (isMounted) {
        setClient(fetchedClient);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [
    params.cda,
    params.cpa,
    params.spaceId,
    params.environment,
    params.preview,
  ]);

  // Memoize client to prevent unnecessary re-renders
  const memoizedClient = useMemo(() => client, [client]);

  // Ensure client is ready before calling useFetchBySlug
  const { isLoading, experience } = useFetchBySlug(
    memoizedClient
      ? {
          client: memoizedClient as ContentfulClientApi<undefined>,
          experienceTypeId: STUDIO_EXPERIENCE_CONTENT_TYPE,
          localeCode: params.locale,
          slug: params.slug,
        }
      : {
          client: undefined as any,
          slug: "",
          experienceTypeId: "",
          localeCode: "",
        } // Prevents calling the hook with undefined client
  );

  if (!client || isLoading) {
    return null; // Show nothing while loading
  }

  if (!experience) {
    return <div>No experience found.</div>;
  }

  const experienceStyles = detachExperienceStyles(experience);

  return (
    <>
      <style>{experienceStyles}</style>
      <ExperienceRoot experience={experience} locale={params.locale} />
    </>
  );
}
