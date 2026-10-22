import Link from "next/link";
import type { NavLink } from "@/lib/site-content";

export default function ResourcesSubnav({ links, current }: { links: NavLink[]; current: string }) {
  const items = [{ href: "/resources", label: "Overview" }, ...links.filter((l) => l.enabled).map((l) => ({ href: l.href, label: l.label }))];
  return (
    <div className="subnav">
      <div className="home-wrap">
        {items.map((i) => (
          <Link key={i.href} href={i.href} aria-current={i.href === current ? "page" : undefined}>{i.label}</Link>
        ))}
      </div>
    </div>
  );
}
