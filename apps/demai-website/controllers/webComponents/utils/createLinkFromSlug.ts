import { SpaceParams } from "@/app/types";

// massage any slug to something that works in website
export default function createLinkFromSlug(slug: string, context: SpaceParams) {
  return `/${context?.locale}/${slug}?space=${context?.spaceId}`;
}
