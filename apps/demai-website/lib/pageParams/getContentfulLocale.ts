import getContentfulClient from "../getContentfulClient";

export default async function getContentfulLocale(
  spaceId: string,
  cda: string,
  cpa: string,
  environment: string,
  locale?: string
): Promise<{ valid: boolean; code: string }> {
  const contentfulClient = await getContentfulClient(
    spaceId,
    cda,
    cpa,
    environment
  );
  if (contentfulClient) {
    const spaceData = await contentfulClient.getSpace();
    const locales = (spaceData.locales || []) as any as {
      code: string;
      default: boolean;
    }[];
    const targetLocal = locales.find(
      (sourceLocale) => sourceLocale.code === locale
    );
    if (targetLocal) {
      return {
        valid: true,
        code: targetLocal.code,
      };
    } else {
      const defaultLocal = locales.find(
        (sourceLocale) => sourceLocale.default === true
      );
      if (defaultLocal) {
        return {
          valid: false,
          code: defaultLocal.code,
        };
      }
    }
  }

  return {
    valid: false,
    code: "",
  };
}
