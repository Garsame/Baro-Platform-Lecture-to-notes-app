import type { Metadata } from "next";
import { docSlugs } from "@/lib/site-content";
import { getSiteContent } from "@/lib/site-content.server";
import DocsView from "../DocsView";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pages = (await getSiteContent()).sections.docs.pages;
  const page = pages[docSlugs(pages).indexOf(slug)];
  return { title: page ? `${page.title} · Documentation` : "Documentation" };
}

export default async function DocsPageRoute({ params }: Props) {
  const { slug } = await params;
  return <DocsView slug={slug} />;
}
