import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { authClient } from "@/lib/auth/client";
import type { OAuthProvider } from "@/lib/auth/providers";

export const Route = createFileRoute("/oauth-popup")({
  component: OAuthPopup,
});

function OAuthPopup() {
  const [message, setMessage] = useState("Connecting to Supabase…");

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams(window.location.search);
    const provider = params.get("provider");
    const callbackURL = params.get("callbackURL") ?? "/";
    const isProvider = (value: string | null): value is OAuthProvider =>
      value === "google" || value === "twitter";

    const completeSignIn = async () => {
      const { data, error } = await authClient.auth.getSession();
      if (error) throw error;
      if (!data.session) throw new Error("No Supabase session was returned.");

      if (window.opener) {
        window.opener.postMessage(
          {
            type: "supabase-auth-complete",
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
          },
          window.location.origin,
        );
        window.close();
        return;
      }
      const callback = new URL(callbackURL, window.location.origin);
      if (callback.origin !== window.location.origin) {
        throw new Error("Sign-in callback must stay on this app.");
      }
      window.location.assign(callback.href);
    };

    const startSignIn = async () => {
      if (!isProvider(provider)) throw new Error("Unsupported sign-in provider.");
      const redirectTo = new URL(window.location.href);
      redirectTo.searchParams.set("provider", provider);
      redirectTo.searchParams.set("callbackURL", callbackURL);
      const { error } = await authClient.auth.signInWithOAuth({
        provider,
        options: { redirectTo: redirectTo.href },
      });
      if (error) throw error;
    };

    const providerError =
      params.get("error_description") ?? params.get("error");
    const authTask = providerError
      ? Promise.reject(new Error(providerError))
      : params.has("code")
        ? completeSignIn()
        : startSignIn();

    void authTask.catch((error: unknown) => {
      if (!active) return;
      setMessage(error instanceof Error ? error.message : "Supabase sign-in failed.");
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="grid min-h-screen place-items-center bg-bg p-6 text-fg">
      <p role="status" className="max-w-sm text-center text-sm text-muted">
        {message}
      </p>
    </main>
  );
}
