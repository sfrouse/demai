import {
  AudienceEntryLike,
  AudienceMapper,
  ExperienceEntryLike,
  ExperienceMapper,
} from "@ninetailed/experience.js-utils-contentful";
import { ContentfulClientApi } from "contentful";

// For the preview widget
export async function getAllExperiences(
  client: ContentfulClientApi<undefined>
) {
  try {
    const query = {
      content_type: "nt_experience",
      include: 1,
    };

    const entries = await client.getEntries(query);
    const experiences = entries.items as unknown as ExperienceEntryLike[];

    const mappedExperiences = (experiences || [])
      .filter((entry) => ExperienceMapper.isExperienceEntry(entry))
      .map((entry) => ExperienceMapper.mapExperience(entry));

    return mappedExperiences;
  } catch {
    return [];
  }
}

export async function getAllAudiences(client: ContentfulClientApi<undefined>) {
  try {
    const query = {
      content_type: "nt_audience",
    };

    const entries = await client.getEntries(query);
    const audiences = entries.items as unknown as AudienceEntryLike[];

    const mappedAudiences = (audiences || [])
      .filter((entry) => AudienceMapper.isAudienceEntry(entry))
      .map((entry) => AudienceMapper.mapAudience(entry))
      .map((entry) => {
        return { ...entry, name: entry?.name ?? "" };
      });

    return mappedAudiences;
  } catch {
    return [];
  }
}
