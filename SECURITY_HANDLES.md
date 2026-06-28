# BaroBadi Platform Security & Validation Handles

This document outlines the security controls, authentication defenses, and file validation measures implemented across the frontend and backend of the BaroBadi Speech-to-Text AI Platform.

---

## 1. Account Enumeration & Portal Segregation

### Generic Error Masking
- **Mechanism:** Both the user and admin sign-in endpoints are designed to prevent account or role enumeration. If authentication fails, the system returns a generic error message: `"Incorrect email or password"`.
- **Backend Implementation:** Handled in `POST /login` and `POST /admin-login` endpoints inside `auth.py`. The API does not distinguish between a non-existent email and an incorrect password, ensuring attackers cannot probe the database to verify active accounts.

### Role & Portal Separation
- **Defensive Guard:** Admin accounts cannot authenticate via the standard user portal, and standard users cannot authenticate via the Admin Portal.
- **Enforcement:**
  - `POST /login` explicitly checks the user role. If the authenticating user is an admin, the system denies access using the generic error response.
  - `POST /admin-login` restricts access exclusively to users with `role == "admin"`. Standard user login attempts are rejected with the same generic error.

---

## 2. Authentication Defenses & Lockouts

### Password Strength Constraints
- **Validation:** Minimum 8-character password length constraint is enforced across all entry points: manual sign-up, admin sign-up, and profile update forms.
- **Frontend Validation:** The `/sign-up`, `/admin-signup`, and profile settings forms check input lengths client-side and block submission if passwords are less than 8 characters, guiding users with clear UI warnings.
- **Backend Validation:** Enforced inside the `create_new_user`, `create_new_admin_user`, and `update_user_profile` endpoints in `auth.py` to prevent API-level bypasses.

### Temporary Login Lockout (Brute-Force Protection)
- **Mechanism:** To protect accounts against dictionary attacks and brute-force password guessing, user profiles are temporarily locked out after repeated login failures.
- **Implementation Details:**
  - Accounts are locked out for **15 minutes** after **4 consecutive failed login attempts**.
  - A datetime field `lockout_until` and an integer counter `login_attempts` are tracked in the `users` table.
  - Successful authentication immediately resets `login_attempts` to 0 and clears `lockout_until`.
  - Attempts are checked on the backend before credentials are processed, ensuring database load is minimized during lockout.

---

## 3. OTP Verification Rate Limiting

### Code Invalidation and Attempt Limits
- **Mechanism:** To prevent verification code guessing (since OTPs are 6-digit codes), a strict failure threshold is enforced.
- **Implementation:**
  - An integer column `otp_attempts` is tracked in the `users` table.
  - Users are allowed a maximum of **5 incorrect attempts** when verifying their email address.
  - Upon reaching the 5-attempt limit, the OTP code and its expiration timestamp are permanently cleared (`NULL`) from the database, rendering the previous code completely invalid.
  - The user is forced to request a new verification code.

---

## 4. Session Inactivity Expiration

### 30-Minute Idle Timeouts
- **Mechanism:** Sessions automatically expire if the user remains inactive, mitigating risks associated with unattended terminals.
- **Frontend Tracking:**
  - Client-side event listeners track activity triggers (`mousemove`, `keydown`, `click`, `scroll`) in both the user layout `(user)/layout.tsx` and admin layout `(admin)/layout.tsx`.
  - An idle timer runs in the background. If no events occur for **30 minutes**, the session state is cleared (`clearSession()`), and the user is redirected to the appropriate sign-in portal.
  - Redirected URLs include an `expired=true` query parameter, displaying a warning message explaining that the session was closed due to inactivity.

---

## 5. File Upload Controls & Validation

### Dual-Layer Magic-Byte signature Checks
- **The Vector:** Attackers often bypass extension and MIME-type restrictions by renaming malicious files (e.g. renaming `exploit.exe` or `payload.zip` to `video.mp4`).
- **Backend Verification:** In `POST /api/v1/lectures/upload`, the backend reads the first 256 bytes of the file and inspects the binary signature (magic bytes) against known container markers:
  - **MP4/MOV:** Looks for the ASCII `ftyp` marker in the first 24 bytes.
  - **WebM/MKV:** Verifies the presence of the EBML header `\x1a\x45\xdf\xa3`.
  - **AVI:** Verifies the `RIFF` header and `AVI ` format identifier.
  - **MPEG:** Verifies standard MPEG streams (`\x00\x00\x01\xba` or `\x00\x00\x01\xb3`).
  - **FLV:** Matches `FLV\x01`.
- **Frontend Verification:** An asynchronous signature check runs inside `new-lecture/page.tsx` on file selection. Using the `FileReader` API, it reads the file header client-side and validates the magic bytes locally. This blocks invalid files and partial chunks early, saving network bandwidth.
- **File Size Restrictions:** A hard limit of **500MB** is enforced at both the frontend input selection stage and the backend upload handler.

---

## 6. Email Verification Guards

### Lecture Generation Block
- **Enforcement:** Only users with verified email addresses (or users authenticated via Google) are permitted to create study notes or generate AI quizzes.
- **Backend Guard:** Both the YouTube generation endpoint (`POST /api/v1/lectures/`) and the file upload endpoint (`POST /api/v1/lectures/upload`) check `is_email_verified`. If the user is unverified, the API rejects the request with a `403 Forbidden` response.
- **Frontend Guard:** In `/dashboard/new-lecture`, a blocking screen is rendered for unverified accounts, explaining that email verification is required and providing a link to Profile Settings.

### Profile Email Update Verification Flow
- **Mechanism:** Changing the account email in profile settings invalidates the current verification status, forcing a re-verification process.
- **Implementation:**
  - When a user updates their email in `/dashboard/profile` and saves changes, the backend checks if the input email differs from the current database entry.
  - If changed, the backend updates the email, sets `is_email_verified = False`, and immediately dispatches a new OTP to the new email address.
  - The frontend dynamically updates the local session state, rendering the yellow warning banners.
  - A `"open-otp-modal"` event is dispatched to trigger the OTP input modal immediately, prompting the user to verify their new address without leaving the page.
