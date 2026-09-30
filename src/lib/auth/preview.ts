/**
 * OAuth credentials are supplied through server-side environment variables.
 * Never commit broker or preview client secrets to the application repository.
 */
export const PREVIEW_CLIENT_ID = "";
export const PREVIEW_CLIENT_SECRET = "";

/** The shared auth broker issuer (OIDC discovery lives under it). */
export const GROK_ISSUER_DEFAULT = "https://auth.grok.me";

/** Host patterns accepted for sandbox preview callbacks. */
export const PREVIEW_ALLOWED_HOSTS = ["*.grok-sandbox.com"] as const;
