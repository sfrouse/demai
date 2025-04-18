import getContentfulClient from "../getContentfulClient";

export default async function getContentfulLocale(
  spaceId: string,
  cda: string,
  cpa: string,
  environment: string,
  locale?: string
): Promise<{ valid: boolean; code: string }> {
  try {
    const contentfulClient = await getContentfulClient(
      spaceId,
      cda,
      cpa,
      environment
    );

    if (contentfulClient) {
      const locales = await contentfulClient.getLocales();
      console.log("locales", locales);
      const targetLocal = locales.items.find(
        (sourceLocale) => sourceLocale.code === locale
      );
      if (targetLocal) {
        return {
          valid: true,
          code: targetLocal.code,
        };
      } else {
        const defaultLocal = locales.items.find(
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
  } catch (err) {
    console.error(err);
    return {
      valid: false,
      code: "en-US",
    };
  }
}
