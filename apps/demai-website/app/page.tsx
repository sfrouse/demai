import RootPage from "./rootPage";
import { generateMetadata as rootGenerateMetadata } from "./rootPage";
import { Metadata } from "next";
import getPageParams from "@/lib/pageParams/getPageParams";

export const dynamicParams = false;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}): Promise<Metadata> {
  return rootGenerateMetadata({
    params: await getPageParams([], await searchParams),
  });
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const finalParams = await getPageParams([], await searchParams);
  return RootPage({
    params: finalParams,
  });
}
