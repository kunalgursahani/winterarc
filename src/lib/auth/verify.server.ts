import { getSupabase } from "@/lib/supabase.server";

export type VerifiedUser = { id: string; email: string | null };

export class UnauthorizedError extends Error {
  readonly status = 401;

  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

export async function requireUser(
  accessToken: unknown,
): Promise<VerifiedUser & { accessToken: string }> {
  if (typeof accessToken !== "string" || !accessToken.trim()) {
    throw new UnauthorizedError();
  }

  const supabase = getSupabase(accessToken);
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user) throw new UnauthorizedError();

  return {
    id: data.user.id,
    email: data.user.email ?? null,
    accessToken,
  };
}
