"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiUrl, authHeaders } from "@/lib/api";

export type SectionDescription<T> = {
  key: string;
  label: string;
  public: boolean;
  value: T;
  default: T;
  is_default: boolean;
  updated_at: string | null;
};

export type FieldErrors = Record<string, string>;
type Status = "loading" | "ready" | "saving" | "error";

export function useSectionEditor<T extends object>(key: string) {
  const router = useRouter();
  const [meta, setMeta] = useState<SectionDescription<T> | null>(null);
  const [saved, setSaved] = useState<T | null>(null);
  const [draft, setDraft] = useState<T | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState<string | null>(null);

  const apply = useCallback((data: SectionDescription<T>) => {
    setMeta(data);
    setSaved(data.value);
    setDraft(data.value);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(apiUrl(`/api/v1/admin/site/sections/${key}`), { headers: authHeaders(), cache: "no-store" });
        if (!res.ok) throw new Error("Could not load this section.");
        const data = (await res.json()) as SectionDescription<T>;
        if (!cancelled) {
          apply(data);
          setStatus("ready");
        }
      } catch (e) {
        if (!cancelled) {
          setMessage(e instanceof Error ? e.message : "Could not load this section.");
          setStatus("error");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [key, apply]);

  const isDirty = useMemo(() => JSON.stringify(saved) !== JSON.stringify(draft), [saved, draft]);

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const setField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setDraft((d) => (d ? { ...d, [field]: value } : d));
    setFieldErrors((errs) => {
      if (!(field as string in errs)) return errs;
      const next = { ...errs };
      delete next[field as string];
      return next;
    });
  }, []);

  const save = useCallback(async () => {
    if (!draft) return;
    setStatus("saving");
    setMessage(null);
    try {
      const res = await fetch(apiUrl(`/api/v1/admin/site/sections/${key}`), {
        method: "PUT",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ value: draft }),
      });
      if (res.status === 422) {
        const body = await res.json();
        const errs: FieldErrors = {};
        for (const e of body.detail?.errors ?? []) errs[e.field] = e.message;
        setFieldErrors(errs);
        setMessage("Some fields need attention.");
        setStatus("ready");
        return;
      }
      if (!res.ok) throw new Error("Could not save. Try again.");
      apply((await res.json()) as SectionDescription<T>);
      setFieldErrors({});
      setMessage("Saved. Your changes are live.");
      setStatus("ready");
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not save. Try again.");
      setStatus("ready");
    }
  }, [draft, key, apply, router]);

  const discard = useCallback(() => {
    setDraft(saved);
    setFieldErrors({});
    setMessage(null);
  }, [saved]);

  const reset = useCallback(async () => {
    if (!window.confirm("Reset this section to its default values? Your customizations will be removed.")) return;
    setStatus("saving");
    try {
      const res = await fetch(apiUrl(`/api/v1/admin/site/sections/${key}/reset`), { method: "POST", headers: authHeaders() });
      if (!res.ok) throw new Error("Could not reset.");
      apply((await res.json()) as SectionDescription<T>);
      setFieldErrors({});
      setMessage("Reset to default.");
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not reset.");
    }
    setStatus("ready");
  }, [key, apply, router]);

  return { meta, saved, draft, isDirty, fieldErrors, status, message, setField, save, discard, reset };
}
