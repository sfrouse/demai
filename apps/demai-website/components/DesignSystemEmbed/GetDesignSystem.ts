import { SpaceParams } from "@/app/types";
import getContentfulClient from "@/lib/getContentfulClient";
import getContentfulEntryById from "@/lib/getContentfulEntryById";

const DEMAI_TOKENS_SINGLETON_ENTRY_ID = "demai-tokens-entry";
const DEMAI_COMPONENT_CTYPE_ID = "demai-component";

export default async function getDesignSystem(params: SpaceParams) {
  const client = await getContentfulClient(
    params.spaceId,
    params.cda,
    params.cpa,
    params.environment,
    params.preview
  );
  if (!client) return { css: "", components: "", precompiledJavascript: "" };
  const demaiTokens = (await getContentfulEntryById(
    client,
    DEMAI_TOKENS_SINGLETON_ENTRY_ID,
    params.locale
  )) as any;

  const demaiComponents = await client.getEntries({
    content_type: DEMAI_COMPONENT_CTYPE_ID,
    locale: params.locale,
    limit: 1000,
  });

  const compJS = demaiComponents.items
    .map((item: any) => item.fields.javascript.replace("import", "// import"))
    .join("\n");

  const results = {
    css: demaiTokens?.fields.css,
    precompiledJavascript: demaiTokens?.fields.precompiledJavascript,
    components: compJS,
  };

  return results;
}
