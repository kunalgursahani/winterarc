# Supabase Auth and database setup

Winterarc uses Supabase Auth for email/password, Google, and X sign-in. Its
publishable key is intentionally public; the app never uses a Supabase secret
or service-role key. User log and goal requests carry the signed-in user's
access token, and database access is restricted by row-level security.

## Database

In the Supabase project SQL Editor, run [`migrations/0001_winterarc.sql`](./migrations/0001_winterarc.sql).
It creates the profile and workout-log tables and policies that let each signed-in
user access only rows whose `user_id` matches their Supabase account.

## Sign-in providers

In **Authentication → Providers**, enable Email, Google, and X (Twitter). Add
the provider credentials from Google Cloud and X Developer Portal to Supabase's
provider settings; do not add those OAuth secrets to this repository or Vercel.
For Google, register the Supabase callback URL shown on the Google provider
settings page in Google Cloud.

In **Authentication → URL Configuration**, set the Site URL to the deployed
Winterarc URL and allow the deployed URL, Vercel preview URLs, local development
URL, and the live-preview callback pattern:

- `https://your-winterarc-domain.example/`
- `https://*.vercel.app/**`
- `http://localhost:8080/`
- `https://*.grok-sandbox.com/oauth-popup`

The app redirects OAuth back to `/oauth-popup` in an embedded preview and to
`/` when deployed.

## Vercel

Import `kunalgursahani/winterarc` into Vercel. A push to `main` deploys
automatically when the GitHub integration is enabled. No Grok auth credentials,
Better Auth secret, Supabase service-role key, or database URL is required by
this app.
