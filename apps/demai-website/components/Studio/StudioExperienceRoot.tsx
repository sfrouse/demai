"use client";

import React from "react";
import { ExperienceRoot } from "@contentful/experiences-sdk-react";
import registerComponents from "./webComponents/register-studio-components";
registerComponents();

export type StudioExperienceRootParams = {
  experience: string;
  experienceStyles: string;
  locale: string;
};

export const StudioExperienceRoot: React.FC<StudioExperienceRootParams> = (
  props
) => {
  const { locale, experience, experienceStyles } = props;
  return (
    <>
      <style>{experienceStyles || ""}</style>
      <ExperienceRoot experience={experience} locale={locale} />
    </>
  );
};
