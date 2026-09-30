import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { authClient } from "./client";

/** Normalized user shape used across the app, auth on or off. */
export type AppUser = {
  id: string;
  displayName: string | null;
  primaryEmail: string | null;
  profileImageUrl: string | null;
  /** Supabase Auth is always enabled for this application. */
  isDevFallback: boolean;
};

/** `useCurrentUserState()` result: the user plus the session-loading flag. */
export type CurrentUserState = {
  /** The user — `null` BOTH while the session loads and when signed out. */
  user: AppUser | null;
  /** True while the session is still resolving — don't treat `user: null` as signed out yet. */
  isPending: boolean;
  error: string | null;
};

function toAppUser(user: User | null): AppUser | null {
  if (!user) return null;
  const metadata = user.user_metadata;
  return {
    id: user.id,
    displayName:
      (typeof metadata.full_name === "string" && metadata.full_name) ||
      (typeof metadata.name === "string" && metadata.name) ||
      user.email ||
      null,
    primaryEmail: user.email ?? null,
    profileImageUrl:
      typeof metadata.avatar_url === "string" ? metadata.avatar_url : null,
    isDevFallback: false,
  };
}

export function useCurrentUserState(): CurrentUserState {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isPending, setIsPending] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const {
      data: { subscription },
    } = authClient.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUser(toAppUser(session?.user ?? null));
      setIsPending(false);
      setError(null);
    });

    void authClient.auth
      .getSession()
      .then(({ data, error: sessionError }) => {
        if (!active) return;
        setUser(toAppUser(data.session?.user ?? null));
        setIsPending(false);
        setError(sessionError?.message ?? null);
      })
      .catch((sessionError: unknown) => {
        if (!active) return;
        setIsPending(false);
        setError(
          sessionError instanceof Error
            ? sessionError.message
            : "Could not read the Supabase session.",
        );
      });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, isPending, error };
}

/**
 * Convenience view of `useCurrentUserState().user` for display (e.g.
 * `user?.displayName ?? "Guest"`). NOTE: `null` means *loading OR signed out* —
 * for redirects/guards use `useCurrentUserState()` and check `isPending`.
 */
export function useCurrentUser(): AppUser | null {
  return useCurrentUserState().user;
}
