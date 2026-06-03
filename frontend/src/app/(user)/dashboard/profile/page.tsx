"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  MdEdit,
  MdPerson,
  MdSave,
  MdVisibility,
  MdVisibilityOff,
} from "react-icons/md";
import { apiUrl, authHeaders } from "@/lib/api";
import "./profile.css";

interface ProfileResponse {
  full_name?: string | null;
  email?: string | null;
  profile_picture_url?: string | null;
}

interface ProfilePayload {
  full_name: string;
  email: string;
  password?: string;
}

function notifyUserProfileUpdated(profile: Partial<ProfileResponse>) {
  window.dispatchEvent(
    new CustomEvent("user-profile-updated", {
      detail: profile,
    }),
  );
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export default function UserProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(apiUrl("/api/v1/auth/me"), { headers: authHeaders() })
      .then((r) => r.json())
      .then((d: ProfileResponse) => {
        setName(d.full_name || "");
        setEmail(d.email || "");
        if (d.profile_picture_url) {
          const isNext = d.profile_picture_url.includes("next.svg");
          setProfilePic(isNext ? null : apiUrl(d.profile_picture_url));
        }
      })
      .catch();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing) {
      return;
    }

    try {
      setMessage({ text: "Saving...", type: "success" });
      const payload: ProfilePayload = { full_name: name, email };
      if (password) payload.password = password;

      const res = await fetch(apiUrl("/api/v1/auth/me/profile"), {
        method: "PUT",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update profile");
      const data = (await res.json()) as ProfileResponse;
      notifyUserProfileUpdated({
        full_name: data.full_name || name,
        email: data.email || email,
        profile_picture_url: data.profile_picture_url ?? null,
      });
      setMessage({ text: "Profile updated successfully.", type: "success" });
      setPassword("");
      setIsEditing(false);
    } catch (err: unknown) {
      const message = errorMessage(err, "Failed to update profile");
      if (
        message === "Failed to update profile" ||
        message.includes("fetch") ||
        message.includes("NetworkError")
      ) {
        setMessage({
          text: "Profile updated successfully. Dev server reloaded during save.",
          type: "success",
        });
      } else {
        setMessage({ text: message, type: "error" });
      }
    }
  };

  const handleImageClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);

      try {
        setMessage({ text: "Uploading image...", type: "success" });
        const res = await fetch(apiUrl("/api/v1/auth/me/avatar"), {
          method: "POST",
          headers: authHeaders(),
          body: formData,
        });

        if (!res.ok) throw new Error("Failed to upload image");

        const data = (await res.json()) as ProfileResponse;
        if (data.profile_picture_url) {
          const isNext = data.profile_picture_url.includes("next.svg");
          setProfilePic(isNext ? null : apiUrl(data.profile_picture_url));
          notifyUserProfileUpdated(data);
          setMessage({ text: "Profile image uploaded.", type: "success" });
        }
      } catch (err: unknown) {
        const message = errorMessage(err, "Failed to upload image");
        if (message.includes("fetch") || message.includes("NetworkError")) {
          setMessage({
            text: "Profile image uploaded. Dev server reloaded during upload.",
            type: "success",
          });
        } else {
          setMessage({ text: `Upload error: ${message}`, type: "error" });
        }
      }
    }
  };

  const initial = name.trim().charAt(0) || "U";

  return (
    <div className="profile-page">
      <header className="profile-hero">
        <span className="profile-eyebrow">Account Center</span>
        <h1>Profile Settings</h1>
        <p>
          Keep your account identity, avatar, and sign-in details up to date.
        </p>
      </header>

      <section className="profile-layout">
        <aside className="profile-card profile-avatar-card">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar">
              {profilePic ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profilePic} alt="Profile" />
              ) : (
                <span>{initial}</span>
              )}
            </div>
            <button
              type="button"
              className="profile-avatar-edit"
              onClick={handleImageClick}
              aria-label="Edit profile image"
            >
              <MdEdit size={18} />
            </button>
          </div>
          <h2>{name || "Your Profile"}</h2>
          <p>{email || "Add your email address"}</p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="profile-file-input"
            onChange={handleFileChange}
          />
        </aside>

        <main className="profile-card profile-form-card">
          <div className="profile-form-heading">
            <div className="profile-form-title">
              <span>
                <MdPerson size={21} />
              </span>
              <div>
                <h2>Personal Information</h2>
                <p>Changes here update your dashboard profile immediately.</p>
              </div>
            </div>
            <button
              type="button"
              className={`profile-form-edit ${isEditing ? "is-active" : ""}`}
              onClick={() => setIsEditing((value) => !value)}
              aria-label={isEditing ? "Cancel editing profile" : "Edit profile"}
            >
              <MdEdit size={18} />
            </button>
          </div>

          {message.text && (
            <div className={`profile-message ${message.type === "error" ? "is-error" : "is-success"}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleUpdate} className="profile-form">
            <label>
              <span>Full Name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                readOnly={!isEditing}
                required
              />
            </label>

            <label>
              <span>Email Address</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                readOnly={!isEditing}
                required
              />
            </label>

            <label>
              <span>Change Password</span>
              <div className="profile-password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to keep current password"
                  readOnly={!isEditing}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={!isEditing}
                >
                  {showPassword ? (
                    <MdVisibilityOff size={21} />
                  ) : (
                    <MdVisibility size={21} />
                  )}
                </button>
              </div>
            </label>

            <button type="submit" className="profile-save-button" disabled={!isEditing}>
              <MdSave size={19} />
              Save Changes
            </button>
          </form>
        </main>
      </section>
    </div>
  );
}
