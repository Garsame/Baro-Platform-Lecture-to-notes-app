"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MdAdd,
  MdAutoAwesome,
  MdCheckCircle,
  MdDarkMode,
  MdDashboard,
  MdKeyboardArrowDown,
  MdLibraryBooks,
  MdLightMode,
  MdLogout,
  MdMenu,
  MdNotifications,
  MdOutlineOndemandVideo,
  MdRocketLaunch,
  MdSchool,
  MdSettings,
  MdWarning,
} from "react-icons/md";
import {
  apiUrl,
  authHeaders,
  fetchCurrentUser,
  type AuthenticatedUser,
} from "@/lib/api";
import { clearSession, getSessionToken } from "@/lib/session";
import "./user-dashboard-shell.css";

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

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: MdDashboard },
  { href: "/dashboard/new-lecture", label: "New Lecture", icon: MdAdd },
  { href: "/dashboard/my-lectures", label: "My Lectures", icon: MdOutlineOndemandVideo },
  { href: "/dashboard/notes", label: "Notes Library", icon: MdLibraryBooks },
  { href: "/dashboard/quizzes", label: "AI Quizzes", icon: MdSchool },
];

function resolveProfileImageUrl(profilePictureUrl?: string | null): string | null {
  if (!profilePictureUrl || profilePictureUrl.includes("next.svg")) return null;
  if (/^https?:\/\//i.test(profilePictureUrl)) return profilePictureUrl;
  return apiUrl(profilePictureUrl);
}

function getNotificationView(notification: ActivityNotification) {
  let Icon = MdCheckCircle;
  let tone = "success";
  let title = notification.action.replace(/_/g, " ");
  let description = "";

  if (notification.action === "USER_LOGIN") {
    title = "Logged in";
    description = `Session started for ${notification.details?.email || "your account"}.`;
  } else if (notification.action === "USER_SIGNUP") {
    title = "Account created";
    description = "Your BaroBadi learning workspace is ready.";
  } else if (notification.action === "LECTURE_SUBMITTED") {
    Icon = MdRocketLaunch;
    tone = "info";
    title = "Lecture submitted";
    description = `"${notification.details?.title || "Untitled"}" is being processed.`;
  } else if (notification.action === "LECTURE_COMPLETED") {
    title = "Lecture completed";
    description = `Generated Somali notes for "${notification.details?.title || "Untitled"}".`;
  } else if (notification.action === "LECTURE_FAILED") {
    Icon = MdWarning;
    tone = "danger";
    title = "Processing failed";
    description = `"${notification.details?.title || "Untitled"}" failed at ${notification.details?.error_stage || "unknown stage"}.`;
  }

  return { Icon, tone, title, description };
}

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState("light");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<ActivityNotification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

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
    const savedTheme = localStorage.getItem("user-theme");
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      localStorage.setItem("user-theme", "light");
    }

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

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("user-theme", nextTheme);
  };

  const handleLogout = () => {
    clearSession();
    window.location.replace("/sign-in");
  };

  if (isLoading || !user) {
    return (
      <div className="inapp-dashboard-loading">
        <div className="inapp-loading-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <img src={theme === "dark" ? "/barobadi-logo-dark.png" : "/barobadi-logo.png"} alt="BaroBadi Logo" style={{ width: "150px", height: "auto", objectFit: "contain", animation: "user-loading-pulse 2s infinite ease-in-out" }} />
          <style>{`
            @keyframes user-loading-pulse {
              0%, 100% { opacity: 0.6; transform: scale(0.98); }
              50% { opacity: 1; transform: scale(1.02); }
            }
          `}</style>
          <strong>Loading dashboard</strong>
          <small>Preparing your BaroBadi workspace.</small>
        </div>
      </div>
    );
  }

  const profileImageUrl = resolveProfileImageUrl(user.profile_picture_url);
  const getInitials = (name: string) => (name ? name.charAt(0).toUpperCase() : "U");

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === href;
    if (href === "/dashboard/my-lectures") {
      return pathname.startsWith("/dashboard/my-lectures") || pathname.startsWith("/dashboard/lecture");
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="inapp-dashboard-shell" data-theme={theme}>
      {isSidebarOpen && (
        <button
          className="inapp-sidebar-backdrop"
          aria-label="Close menu"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`inapp-sidebar ${isSidebarOpen ? "is-open" : ""}`}>
        <Link href="/dashboard" className="inapp-brand">
          <img src={theme === "dark" ? "/barobadi-logo-dark.png" : "/barobadi-logo.png"} alt="BaroBadi Logo" style={{ width: "135px", height: "auto", objectFit: "contain" }} />
        </Link>

        <div className="inapp-nav-group">
          <span className="inapp-nav-label">Main</span>
          <nav className="inapp-nav" aria-label="User dashboard navigation">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  href={item.href}
                  className={`inapp-nav-link ${isActive(item.href) ? "active" : ""}`}
                  key={item.href}
                >
                  <Icon />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="inapp-nav-group account">
          <span className="inapp-nav-label">Account</span>
          <Link href="/dashboard/profile" className="inapp-nav-link">
            <MdSettings />
            <span>Profile Settings</span>
          </Link>
          <button className="inapp-nav-link danger" onClick={handleLogout}>
            <MdLogout />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <div className="inapp-main-shell">
        <header className="inapp-topbar">
          <button
            className="inapp-icon-button inapp-menu-button"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open menu"
            title="Open menu"
          >
            <MdMenu />
          </button>

          <div className="inapp-topbar-spacer" />

          <div className="inapp-topbar-actions" ref={dropdownRef}>
            <button
              className="inapp-icon-button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              {theme === "dark" ? <MdLightMode /> : <MdDarkMode />}
            </button>

            <div className="inapp-popover-wrap">
              <button
                className="inapp-icon-button"
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfile(false);
                }}
                aria-label="Show notifications"
                title="Notifications"
              >
                <MdNotifications />
                {notifications.length > 0 && <span className="inapp-unread-dot" />}
              </button>

              {showNotifications && (
                <div className="inapp-dropdown inapp-notifications">
                  <div className="inapp-dropdown-heading">
                    <strong>Recent Activity</strong>
                    <span>{notifications.length} updates</span>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="inapp-dropdown-empty">No recent activity.</p>
                  ) : (
                    notifications.map((notification) => {
                      const item = getNotificationView(notification);
                      const Icon = item.Icon;
                      return (
                        <div className="inapp-notification-item" key={notification.id}>
                          <span className={`inapp-notification-icon ${item.tone}`}>
                            <Icon />
                          </span>
                          <div>
                            <strong>{item.title}</strong>
                            {item.description && <p>{item.description}</p>}
                            <small>{new Date(notification.created_at).toLocaleString()}</small>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            <div className="inapp-popover-wrap">
              <button
                className="inapp-profile-trigger"
                onClick={() => {
                  setShowProfile(!showProfile);
                  setShowNotifications(false);
                }}
                aria-label="Show profile menu"
              >
                <span className="inapp-avatar">
                  {profileImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profileImageUrl} alt="Profile" />
                  ) : (
                    getInitials(user.full_name)
                  )}
                </span>
                <span className="inapp-profile-name">{user.full_name}</span>
                <MdKeyboardArrowDown />
              </button>

              {showProfile && (
                <div className="inapp-dropdown inapp-profile-dropdown">
                  <div className="inapp-profile-summary">
                    <span className="inapp-avatar large">
                      {profileImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={profileImageUrl} alt="Profile" />
                      ) : (
                        getInitials(user.full_name)
                      )}
                    </span>
                    <strong>{user.full_name}</strong>
                    <small>{user.email}</small>
                  </div>
                  <Link href="/dashboard/profile" onClick={() => setShowProfile(false)}>
                    <MdSettings /> Edit Profile
                  </Link>
                  <button onClick={handleLogout}>
                    <MdLogout /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="inapp-dashboard-main">{children}</main>
      </div>
    </div>
  );
}
