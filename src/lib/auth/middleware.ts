import { createMiddleware } from "@tanstack/react-start";

/**
 * Verifies the Supabase access token before any per-user server function runs.
 */
export const authMiddleware = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    // Supabase keeps sessions in browser storage, so forward the access token to
    // each server function for verification and RLS-scoped database access.
    const { getBearerToken } = await import("./client");
    return next({ sendContext: { bearerToken: (await getBearerToken()) ?? undefined } });
  })
  .server(async ({ next, context }) => {
    // Import request-bound modules only on the server branch.
    const { assertSameSiteRequest } = await import("./isolation.server");
    const { requireUser } = await import("./verify.server");
    // Reject scripted cross-site/sibling requests before touching per-user data.
    assertSameSiteRequest();
    const user = await requireUser(context.bearerToken);
    return next({
      context: {
        userId: user.id,
        supabaseAccessToken: user.accessToken,
      },
    });
  });
