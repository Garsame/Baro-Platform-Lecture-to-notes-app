"use client";

import React, { useState, useEffect } from "react";
import PublicHeader from "./PublicHeader";
import BrandLogo from "@/components/site/BrandLogo";
import { useBranding } from "@/components/site/SiteContentProvider";
import SiteFooter from "@/components/site/SiteFooter";
import "./public.css";
import "@/components/site/site-chrome.css";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const branding = useBranding();
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    // Fade out preloader
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px -20px",
      threshold: 0.02,
    };

    const scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal-active");
        }
      });
    }, observerOptions);

    const observeAll = () => {
      const elements = document.querySelectorAll(
        ".reveal-left, .reveal-right, .reveal-up, .reveal-scale"
      );
      elements.forEach((el) => {
        scrollObserver.observe(el);
      });
    };

    // Run initially
    observeAll();

    // Reactive MutationObserver handles client-side page transitions dynamically
    const mutationObserver = new MutationObserver(() => {
      observeAll();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      scrollObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [children]);

  return (
    <div className="public-layout">
      {isPageLoading && (
        <div className="page-preloader" role="status" aria-busy="true">
          <div className="preloader-logo">
            <BrandLogo height={38} />
            <div className="preloader-bar-container">
              <div className="preloader-bar"></div>
            </div>
          </div>
        </div>
      )}

      <PublicHeader />
      <main className="public-main">{children}</main>
      <SiteFooter />
    </div>
  );
}
