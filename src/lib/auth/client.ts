import { createClient } from "@supabase/supabase-js";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/supabase-config";
import type { OAuthProvider } from "./providers";

export const authClient = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce",
      persistSession: true,
    },
  },
);

export const authEnabled = true;

export async function getBearerToken(): Promise<string | null> {
  const { data, error } = await authClient.auth.getSession();
  if (error) throw error;
  return data.session?.access_token ?? null;
}

function inLivePreview(): boolean {
  return (
    typeof window !== "undefined" &&
    window.location.hostname.endsWith(".grok-sandbox.com")
  );
}

export async function signIn(
  provider: OAuthProvider,
  opts: { callbackURL?: string } = {},
): Promise<void> {
  if (typeof window === "undefined") return;

  const callback = new URL(opts.callbackURL ?? "/", window.location.origin);
  if (callback.origin !== window.location.origin) {
    throw new Error("Sign-in callback must stay on this app.");
  }
  const callbackURL = `${callback.pathname}${callback.search}${callback.hash}`;
  if (!inLivePreview()) {
    const { error } = await authClient.auth.signInWithOAuth({
      provider,
      options: { redirectTo: new URL(callbackURL, window.location.origin).href },
    });
    if (error) throw error;
    return;
  }

  const popup = window.open(
    `/oauth-popup?provider=${encodeURIComponent(provider)}&callbackURL=${encodeURIComponent(callbackURL)}`,
    `supabase-auth-${Date.now()}`,
    "popup,width=500,height=650",
  );
  if (!popup) throw new Error("Pop-up blocked. Allow pop-ups and try again.");

  await new Promise<void>((resolve, reject) => {
    let settled = false;
    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      window.clearInterval(closeTimer);
      window.removeEventListener("message", onMessage);
      if (error) reject(error);
      else resolve();
    };
    const onMessage = (event: MessageEvent<unknown>) => {
      if (event.origin !== window.location.origin || event.source !== popup) return;
      const payload = event.data as
        | { type?: unknown; accessToken?: unknown; refreshToken?: unknown }
        | undefined;
      if (
        payload?.type !== "supabase-auth-complete" ||
        typeof payload.accessToken !== "string" ||
        typeof payload.refreshToken !== "string"
      ) {
        return;
      }

      void authClient.auth
        .setSession({
          access_token: payload.accessToken,
          refresh_token: payload.refreshToken,
        })
        .then(({ error }) => {
          if (error) {
            finish(error);
            return;
          }
          popup.close();
          finish();
          window.location.assign(callbackURL);
        })
        .catch((error: unknown) =>
          finish(error instanceof Error ? error : new Error("Could not finish sign-in.")),
        );
    };
    const closeTimer = window.setInterval(() => {
      if (popup.closed) finish(new Error("Sign-in was cancelled."));
    }, 500);
    window.addEventListener("message", onMessage);
  });
}

export async function signOut(redirectTo = "/login"): Promise<void> {
  const { error } = await authClient.auth.signOut();
  if (error) throw error;
  if (typeof window !== "undefined") window.location.assign(redirectTo);
}
