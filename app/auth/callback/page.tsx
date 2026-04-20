"use client";

// Client-side OAuth callback handler.
// The PKCE code verifier is stored by the browser client, so the exchange
// MUST happen client-side — a server route can't access the verifier.
// Wrapped in Suspense because useSearchParams() requires it in Next.js 14.

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "../../../lib/supabase-browser";

const Spinner = () => (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#131313",
    }}
  >
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: "50%",
        border: "2px solid rgba(255,255,255,0.15)",
        borderTopColor: "#ff41b3",
        animation: "spin 0.8s linear infinite",
      }}
    />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const supabase = createClient();
    const code = searchParams.get("code");
    const tokenHash = searchParams.get("token_hash");
    const type = searchParams.get("type");
    const next = searchParams.get("next") ?? "/home";

    // Password reset emails use token_hash + type=recovery
    if (tokenHash && type) {
      supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as "recovery" | "email" }).then(({ error }) => {
        if (error) {
          console.error("Token verify error:", error.message);
          router.replace("/login?error=auth");
          return;
        }
        router.refresh();
        router.replace(type === "recovery" ? "/reset-password" : next);
      });
      return;
    }

    // Google / GitHub OAuth uses a code
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          console.error("Auth callback error:", error.message);
          router.replace("/login?error=auth");
          return;
        }
        // Update last_active_at (fire and forget)
        fetch("/api/user/ping", { method: "POST" }).catch(() => {});
        // Auto-enroll as standard affiliate (fire and forget)
        fetch("/api/affiliate/auto-enroll", { method: "POST" }).catch(() => {});
        router.refresh();
        router.replace(next);
      });
      return;
    }

    router.replace("/login?error=auth");
  }, []);

  return <Spinner />;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <CallbackHandler />
    </Suspense>
  );
}
