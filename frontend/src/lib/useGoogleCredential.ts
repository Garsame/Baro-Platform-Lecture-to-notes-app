"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type GoogleIdentity = {
  accounts: {
    id: {
      initialize: (config: { client_id: string; callback: (response: { credential?: string }) => void }) => void;
      renderButton: (el: HTMLElement, options: Record<string, unknown>) => void;
    };
  };
};

const googleApi = (): GoogleIdentity | undefined => (window as unknown as { google?: GoogleIdentity }).google;

/**
 * Google credential for sign-up. With NEXT_PUBLIC_GOOGLE_CLIENT_ID set it renders Google's own button into
 * `slotRef`; without it, `openPopup` opens the development account chooser that posts a mock token.
 */
export function useGoogleCredential(onToken: (token: string) => void) {
  const slotRef = useRef<HTMLDivElement>(null);
  const [hasClientId, setHasClientId] = useState(false);
  const handler = useRef(onToken);

  useEffect(() => {
    handler.current = onToken;
  }, [onToken]);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasClientId(!!clientId);
    if (!clientId) return;

    const render = () => {
      const api = googleApi();
      if (!api || !slotRef.current) return;
      api.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response.credential) handler.current(response.credential);
        },
      });
      slotRef.current.innerHTML = "";
      const width = Math.min(Math.max(slotRef.current.getBoundingClientRect().width, 200), 400);
      api.accounts.id.renderButton(slotRef.current, { theme: "outline", size: "large", width, text: "signup_with", logo_alignment: "left", shape: "pill" });
    };

    if (googleApi()) {
      render();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = render;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data && event.data.type === "google-login-success") handler.current(event.data.token);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const openPopup = useCallback(() => {
    const width = 500;
    const height = 650;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    window.open("/google-chooser", "GoogleSignOn", `width=${width},height=${height},left=${left},top=${top}`);
  }, []);

  return { slotRef, hasClientId, openPopup };
}
