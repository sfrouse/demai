import getContentfulClient from "@/lib/getContentfulClient";
import getContentfulPage from "@/lib/getContentfulPage";
import { Metadata } from "next";
import getContentfulExperience from "@/lib/getContentfulExperience";
import { SpaceParams } from "./types";
import DemoToolbar from "@/components/DemoToolbar/DemoToolbar";
import {
  getAllAudiences,
  getAllExperiences,
} from "@/lib/getNinetailedContentful";
import Providers from "@/components/Client/Providers";
import TrackPage from "@/components/Client/TrackPage";
import { StudioServer } from "@/components/Studio/StudioServer";
import ComponentRenderer from "@/components/ComponentRenderer/ComponentRenderer";
import { LivePreviewComponentRenderer } from "@/components/ComponentRenderer/LivePreviewComponentRenderer";
import getContentfulEntryById from "@/lib/getContentfulEntryById";
// import bindingInjection from "@/controllers/webComponents/bindings/utils/bindingInjection";

export const fetchCache = "force-no-store"; // Prevents caching

// TODO: centralize these vars
export const WEBSITE_ID = "website-1";
export const WEBSITE_GLOBAL_STYLES = "globalStyles";

export async function generateMetadata({
  params,
}: {
  params: SpaceParams | undefined;
}): Promise<Metadata> {
  if (!params) return {};

  const client = await getContentfulClient(
    params.spaceId,
    params.cda,
    params.cpa,
    params.environment,
    params.preview
  );
  if (!client) return {};
  const page = await getContentfulPage(client, params.locale, params.slug);
  const experience = await getContentfulExperience(
    client,
    params.locale,
    params.slug
  );
  return {
    title: page
      ? `${page.fields?.title}`
      : `${(experience as any)?.fields.title}`,
    // description: data.description,
    alternates: {
      canonical: `https://${process.env.VERCEL_URL}/${params.locale}/${params.slug}?space=${params.spaceId}:${params.environment}`,
    },
  };
}

/**==========================
 * RootPage
 ===========================*/
export default async function RootPage({
  params,
}: {
  params: SpaceParams | undefined;
}) {
  if (!params) {
    return <div>no space found</div>;
  }

  const client = await getContentfulClient(
    params.spaceId,
    params.cda,
    params.cpa,
    params.environment,
    params.preview
  );
  if (!client) return false;

  const [allExperiences, allAudiences] = await Promise.all([
    getAllExperiences(client),
    getAllAudiences(client),
  ]);

  // only have Web Comp Page right now...
  // but you can put React comps within
  const page = await getContentfulPage(client, params.locale, params.slug);
  const demaiTokens = (await getContentfulEntryById(
    client,
    "demai-tokens-entry",
    params.locale
  )) as any;
  // const bindingStr = bindingInjection(
  //   website?.fields?.bindings?.bindings,
  //   website?.fields?.webComponents?.javascript
  // );

  return (
    <Providers
      ninetailed={{ preview: { allExperiences, allAudiences } }}
      spaceId={params.spaceId}
      env="master"
    >
      <style>{demaiTokens.fields.css}</style>
      {/* <style>{website?.fields?.globalStyles?.css}</style>
      <script type="module">{bindingStr}</script> */}
      <TrackPage />
      {page ? (
        params.preview ? (
          <LivePreviewComponentRenderer entry={page} params={params} />
        ) : (
          <ComponentRenderer entry={page} params={params} />
        )
      ) : null}
      <StudioServer params={params} />
      <DemoToolbar params={params} />
    </Providers>
  );
}
