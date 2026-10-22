"use client";

import type { CSSProperties } from "react";
import { resolveAssetUrl } from "@/lib/site-content";
import { useBranding } from "./SiteContentProvider";

type BrandLogoProps = {
  height?: number | string;
  width?: number | string;
  /** auto renders both logos and lets the theme CSS pick one; light/dark render a single image. */
  variant?: "auto" | "light" | "dark";
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
};

// A plain <img> is used because uploaded logos come from the API host,
// and next/image would need extra host configuration.
export default function BrandLogo({ height = "auto", width = "auto", variant = "auto", className, style, onClick }: BrandLogoProps) {
  const branding = useBranding();
  const light = resolveAssetUrl(branding.logo_light_url) ?? "";
  const dark = resolveAssetUrl(branding.logo_dark_url) ?? "";
  const alt = `${branding.site_name} logo`;
  const base: CSSProperties = { height, width, objectFit: "contain", ...style };

  if (variant === "light") return <img src={light} alt={alt} className={className} style={base} onClick={onClick} />;
  if (variant === "dark") return <img src={dark} alt={alt} className={className} style={base} onClick={onClick} />;

  return (
    <>
      <img src={light} alt={alt} className={`logo-light ${className ?? ""}`.trim()} style={base} onClick={onClick} />
      <img src={dark} alt="" aria-hidden="true" className={`logo-dark ${className ?? ""}`.trim()} style={base} onClick={onClick} />
    </>
  );
}
