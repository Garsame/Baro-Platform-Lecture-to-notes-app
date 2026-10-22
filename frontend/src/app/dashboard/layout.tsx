"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import BrandLogo from "@/components/site/BrandLogo";
import MaterialIcon from "@/components/site/MaterialIcon";
import { useBranding } from "@/components/site/SiteContentProvider";
import { usePathname, useRouter } from "next/navigation";
import {
  apiUrl,
  authHeaders,
  fetchCurrentUser,
  type AuthenticatedUser,
} from "@/lib/api";
import { clearSession, getSessionToken } from "@/lib/session";
import { useTheme } from "@/hooks/useTheme";
import OtpVerificationModal from "@/components/OtpVerificationModal";
import "./app-shell.css";

interface ActivityNotification {
  id: number;
  action: string;
  created_at: string;
  details?: {
    title?: string;
    email?: string;
    role?: string;
    source_type?: string;
    error_stage?: string;
  } | null;
}

const railLinks = [
  { href: "/dashboard", label: "Home", icon: "home" },
  { href: "/dashboard/my-lectures", label: "My lectures", icon: "video_library" },
  { href: "/dashboard/notes", label: "Notes library", icon: "menu_book" },
  { href: "/dashboard/quizzes", label: "Quizzes", icon: "quiz" },
  { href: "/dashboard/profile", label: "Profile", icon: "person" },
  { href: "/", label: "Public site", icon: "public" },
];

function resolveProfileImageUrl(profilePictureUrl?: string | null): string | null {
  if (!profilePictureUrl || profilePictureUrl.includes("next.svg")) return null;
  if (/^https?:\/\//i.test(profilePictureUrl)) return profilePictureUrl;
  return apiUrl(profilePictureUrl);
}

function getNotificationView(notification: ActivityNotification, siteName: string) {
  let title = notification.action.replace(/_/g, " ");
  let description = "";
  const name = `"${notification.details?.title || "Untitled"}"`;
  if (notification.action === "USER_LOGIN") {
    title = "Logged in";
    description = `Session started for ${notification.details?.email || "your account"}.`;
  } else if (notification.action === "USER_SIGNUP") {
    title = "Account created";
    description = `Your ${siteName} workspace is ready.`;
  } else if (notification.action === "LECTURE_SUBMITTED") {
    title = "Lecture submitted";
    description = `${name} is being processed.`;
  } else if (notification.action === "LECTURE_COMPLETED") {
    title = "Lecture completed";
    description = `Generated Somali notes for ${name}.`;
  } else if (notification.action === "LECTURE_FAILED") {
    title = "Processing failed";
    description = `${name} failed at ${notification.details?.error_stage || "unknown stage"}.`;
  } else if (notification.action === "EMAIL_VERIFIED") {
    title = "Email verified";
    description = "Your email has been verified successfully.";
  }
  return { title, description };
}

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { site_name: siteName } = useBranding();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const [notifications, setNotifications] = useState<ActivityNotification[]>([]);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfile(false);
        setShowNotifications(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleUserProfileUpdated(event: Event) {
      const detail = (event as CustomEvent<Partial<AuthenticatedUser>>).detail;
      if (!detail) return;

      setUser((currentUser) => {
        if (!currentUser) return currentUser;
        return { ...currentUser, ...detail };
      });
    }

    window.addEventListener("user-profile-updated", handleUserProfileUpdated);
    return () => window.removeEventListener("user-profile-updated", handleUserProfileUpdated);
  }, []);

  useEffect(() => {
    function handleOpenOtpModal() {
      setIsOtpModalOpen(true);
    }
    window.addEventListener("open-otp-modal", handleOpenOtpModal);
    return () => window.removeEventListener("open-otp-modal", handleOpenOtpModal);
  }, []);

  // Inactivity timeout of 30 minutes (1800000 milliseconds)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        clearSession();
        window.location.replace("/sign-in?expired=true");
      }, 30 * 60 * 1000);
    };

    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, []);

  useEffect(() => {

    const redirectToSignIn = () => {
      clearSession();
      window.location.replace("/sign-in");
    };

    const fetchContext = async () => {
      const token = getSessionToken();

      if (!token) {
        redirectToSignIn();
        return;
      }

      try {
        const currentUser = await fetchCurrentUser(token);

        if (currentUser.role === "admin") {
          window.location.replace("/admin/dashboard");
          return;
        }

        const notifRes = await fetch(apiUrl("/api/v1/auth/me/activity?limit=5"), {
          headers: authHeaders(),
          cache: "no-store",
        });

        setUser(currentUser);
        if (notifRes.ok) setNotifications(await notifRes.json());
      } catch {
        redirectToSignIn();
      } finally {
        setIsLoading(false);
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "token" && !getSessionToken()) {
        redirectToSignIn();
      }
    };

    const handlePageShow = () => {
      if (!getSessionToken()) {
        redirectToSignIn();
      }
    };

    fetchContext();
    window.addEventListener("storage", handleStorage);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);



  const handleLogout = () => {
    clearSession();
    window.location.replace("/sign-in");
  };

  if (isLoading || !user) {
    return (
      <div className="inapp-dashboard-loading">
        <div className="inapp-loading-card">
          <BrandLogo variant={theme === "dark" ? "dark" : "light"} width="150px" />
          <strong>Loading your workspace</strong>
          <small>Preparing your {siteName} account.</small>
        </div>
      </div>
    );
  }

  const profileImageUrl = resolveProfileImageUrl(user.profile_picture_url);
  const firstName = (user.full_name || "").split(" ")[0] || "Account";
  const initials = (user.full_name || "U").trim().charAt(0).toUpperCase();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === href;
    if (href === "/dashboard/my-lectures") {
      return pathname.startsWith("/dashboard/my-lectures") || pathname.startsWith("/dashboard/lecture");
    }
    return pathname.startsWith(href);
  };

  const avatar = (size: "" | "lg") => (
    <span className={`sa-avatar ${size}`}>
      {profileImageUrl ? <img src={profileImageUrl} alt="" /> : initials}
    </span>
  );

  const sendVerification = async () => {
    if (isSendingVerification) return;
    setIsSendingVerification(true);
    try {
      const res = await fetch(apiUrl("/api/v1/auth/verify-email"), { method: "POST", headers: authHeaders() });
      if (res.ok) setIsOtpModalOpen(true);
    } catch {
      // The banner stays so the student can try again.
    } finally {
      setIsSendingVerification(false);
    }
  };

  return (
    <div className="sa-shell" data-theme={theme}>
      <nav className="sa-rail" aria-label="Student app">
        <Link href="/dashboard" className="sa-brand" aria-label={`${siteName} home`}>
          <BrandLogo height={34} variant={theme === "dark" ? "dark" : "light"} />
        </Link>
        <Link href="/dashboard/new-lecture" className="sa-new">
          <MaterialIcon name="add" />New lecture
        </Link>
        {railLinks.map((item) => {
          const active = item.href !== "/" && isActive(item.href);
          return (
            <Link key={item.href} href={item.href} className="sa-link" aria-current={active ? "page" : undefined}>
              <MaterialIcon name={item.icon} filled={active} />{item.label}
            </Link>
          );
        })}
      </nav>

      <div className="sa-main">
        <div className="sa-top">
          <form
            className="sa-search"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              router.push(`/dashboard/my-lectures${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`);
            }}
          >
            <MaterialIcon name="search" />
            <span className="sa-sr">Search your lectures</span>
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search your lectures, notes and terms" />
          </form>
          <span className="sa-spacer" />
          <div className="sa-wrap" ref={dropdownRef} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div className="sa-wrap">
              <button
                type="button"
                className="sa-icon-btn"
                aria-label="Notifications"
                aria-expanded={showNotifications}
                onClick={() => { setShowNotifications((v) => !v); setShowProfile(false); }}
              >
                <MaterialIcon name="notifications" />
                {notifications.length > 0 && <span className="sa-dot" />}
              </button>
              {showNotifications && (
                <div className="sa-menu sa-note">
                  <h3>Recent activity</h3>
                  {notifications.length === 0 && <span className="empty">Nothing new yet.</span>}
                  {notifications.map((n) => {
                    const view = getNotificationView(n, siteName);
                    return (
                      <div className="sa-note-item" key={n.id}>
                        <b>{view.title}</b>
                        {view.description && <span>{view.description}</span>}
                        <small>{new Date(n.created_at).toLocaleString()}</small>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="sa-wrap">
              <button
                type="button"
                className="sa-avatar-btn"
                aria-haspopup="menu"
                aria-expanded={showProfile}
                onClick={() => { setShowProfile((v) => !v); setShowNotifications(false); }}
              >
                {avatar("")}
                <span className="sa-avatar-name">{firstName}</span>
                <MaterialIcon name="expand_more" />
              </button>
              {showProfile && (
                <div className="sa-menu" role="menu">
                  <div className="sa-menu-head">
                    {avatar("lg")}
                    <span style={{ minWidth: 0 }}>
                      <b>{user.full_name}</b>
                      <small>{user.email}</small>
                    </span>
                  </div>
                  <Link href="/dashboard/profile" className="sa-menu-item" role="menuitem" onClick={() => setShowProfile(false)}><MaterialIcon name="person" />Profile</Link>
                  <Link href="/" className="sa-menu-item" role="menuitem"><MaterialIcon name="public" />Public site</Link>
                  <Link href="/contact" className="sa-menu-item" role="menuitem"><MaterialIcon name="help" />Help and contact</Link>
                  <button type="button" className="sa-menu-item" role="menuitem" onClick={toggleTheme}>
                    <MaterialIcon name={theme === "dark" ? "light_mode" : "dark_mode"} />{theme === "dark" ? "Light theme" : "Dark theme"}
                  </button>
                  <button type="button" className="sa-menu-item" role="menuitem" onClick={handleLogout}><MaterialIcon name="logout" />Sign out</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {!user.is_email_verified && (
          <div className="sa-banner">
            <span><MaterialIcon name="mark_email_unread" />Your email address is unverified. Verify it to keep your account secure.</span>
            <button type="button" disabled={isSendingVerification} onClick={sendVerification}>Verify email now</button>
          </div>
        )}
        {!user.has_password && (
          <div className="sa-banner info">
            <span><MaterialIcon name="key" />You signed in with Google. Set a password in your profile if you want to sign in with email later.</span>
            <Link href="/dashboard/profile">Set password</Link>
          </div>
        )}

        <main className="sa-content">{children}</main>
      </div>

      <OtpVerificationModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        email={user.email}
        onSuccess={() => {
          window.dispatchEvent(new CustomEvent("user-profile-updated", { detail: { is_email_verified: true } }));
          window.location.replace("/dashboard");
        }}
      />
    </div>
  );
}
