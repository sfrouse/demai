import RootPage from "@/app/rootPage";
import { generateMetadata as rootGenerateMetadata } from "../rootPage";
// import { Metadata } from "next";
import getPageParams from "@/lib/pageParams/getPageParams";

export const dynamicParams = false;

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{
    slug: string[];
  }>;
  searchParams: Promise<Record<string, string>>;
}) {
  const { slug } = await params;
  return rootGenerateMetadata({
    params: await getPageParams(slug, await searchParams),
  });
}

/* ============================
 * SlugPage
 * ============================
 */
export default async function SlugPage({
  params,
  searchParams,
}: {
  params: Promise<{
    slug: string[];
  }>;
  searchParams: Promise<Record<string, string>>;
}) {
  const { slug } = await params;
  console.log("slug", slug);
  const finalParams = await getPageParams(slug, await searchParams);
  return RootPage({
    params: finalParams,
  });
}
