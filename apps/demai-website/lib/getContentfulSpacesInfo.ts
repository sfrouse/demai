type ContentfulSpaceConfig = {
  name: string | undefined;
  id: string | undefined;
  cda: string | undefined;
  cpa: string | undefined;
};

export default function getContentfulSpacesInfo(): ContentfulSpaceConfig[] {
  const contentfulSpaces =
    process.env.CONTENTFUL_SPACES?.split(",").map((s) =>
      s.trim().toLowerCase()
    ) || [];

  const spaces: ContentfulSpaceConfig[] = [];
  contentfulSpaces.map((spaceName) => {
    spaces.push({
      name: spaceName,
      id: process.env[`CONTENTFUL_${spaceName}_SPACE_ID`],
      cda: process.env[`CONTENTFUL_${spaceName}_DELIVERY_ACCESS_TOKEN`],
      cpa: process.env[`CONTENTFUL_${spaceName}_DELIVERY_ACCESS_TOKEN`],
    });
  });

  return spaces;
}
