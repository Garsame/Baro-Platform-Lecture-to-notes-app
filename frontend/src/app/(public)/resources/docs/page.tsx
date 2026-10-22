import type { Metadata } from "next";
import DocsView from "./DocsView";

export const metadata: Metadata = { title: "Documentation" };

export default function DocsIndexPage() {
  return <DocsView />;
}
