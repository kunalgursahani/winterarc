export const SUPABASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== "undefined" && process.env?.SUPABASE_URL) ||
  "https://qybkheiaeikfphdteklp.supabase.co";

// Publishable client keys are designed for browser use; never put a service key here.
export const SUPABASE_PUBLISHABLE_KEY =
  (typeof import.meta !== "undefined" &&
    (import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
      import.meta.env?.VITE_SUPABASE_ANON_KEY)) ||
  (typeof process !== "undefined" &&
    (process.env?.SUPABASE_PUBLISHABLE_KEY || process.env?.SUPABASE_ANON_KEY)) ||
  "sb_publishable_nEHG11qNaYb3Ndgvz0NLgQ_dIDYqIzv";

