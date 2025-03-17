import { SpaceParams } from "@/app/types";
import getContentfulSpaceName from "./getContentfulSpaceName";
import getContentfulLocale from "./getContentfulLocale";

const DEFAULT_SLUG = "home";

export default async function getPageParams(
  slug: string[] | string = [],
  searchParams: Record<string, string>
): Promise<SpaceParams | undefined> {
  const { preview, space } = await searchParams;
  const spaceName = space;

  const finalPreview =
    preview === "true" || preview === "1" || preview === "yes" ? true : false;
  let slugArray = Array.isArray(slug) ? slug : [];
  slugArray = slugArray.map(decodeURIComponent);

  let spaceInfo = await getContentfulSpaceName([spaceName]);
  if (!spaceInfo) return;

  const locale = await getContentfulLocale(
    spaceInfo.spaceId,
    spaceInfo.cda,
    spaceInfo.cpa,
    spaceInfo.environment,
    slugArray[0]
  );

  // Take off valid locale
  const finalSlug = slugArray;
  if (finalSlug[0] === locale.code) {
    finalSlug.shift();
  }

  const finalParams: SpaceParams = {
    locale: locale.code,
    spaceId: spaceInfo.spaceId,
    spaceName: spaceInfo.spaceName,
    cda: spaceInfo.cda,
    cpa: spaceInfo.cpa,
    slug: finalSlug?.length > 0 ? finalSlug[0] : DEFAULT_SLUG,
    preview: finalPreview,
    environment: spaceInfo.environment,
  };

  return finalParams;
}
