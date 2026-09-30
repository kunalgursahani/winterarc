import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env.server";

const supabaseUrl =
  env("SUPABASE_URL") ?? "https://qybkheiaeikfphdteklp.supabase.co";

let client: SupabaseClient | undefined;

export function isSupabaseConfigured(): boolean {
  return Boolean(env("SUPABASE_SECRET_KEY"));
}

export function getSupabase(): SupabaseClient {
  if (typeof window !== "undefined") {
    throw new Error("Supabase is server-only; call it from a server function.");
  }

  if (client) return client;

  const secretKey = env("SUPABASE_SECRET_KEY");
  if (!secretKey) {
    throw new Error("Missing server-side SUPABASE_SECRET_KEY configuration.");
  }

  client = createClient(supabaseUrl, secretKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
  return client;
}
