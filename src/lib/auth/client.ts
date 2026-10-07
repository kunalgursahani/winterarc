import { createClient } from "@supabase/supabase-js";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/supabase-config";

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

export async function signOut(redirectTo = "/login"): Promise<void> {
  const { error } = await authClient.auth.signOut();
  if (error) throw error;
  if (typeof window !== "undefined") window.location.assign(redirectTo);
}
