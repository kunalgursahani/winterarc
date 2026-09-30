import { createClient } from "@supabase/supabase-js";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./supabase-config";

export function getSupabase(accessToken: string) {
  if (typeof window !== "undefined") {
    throw new Error("Supabase server client cannot be used in the browser.");
  }
  if (!accessToken.trim()) throw new Error("A Supabase access token is required.");

  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  });
}
