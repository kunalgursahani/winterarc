# Supabase Auth and database setup

Winterarc uses Supabase Auth for email/password and phone/SMS OTP sign-in. Its
publishable key is intentionally public; the app never uses a Supabase secret
or service-role key. User log and goal requests carry the signed-in user's
access token, and database access is restricted by row-level security.

## Database

In the Supabase project SQL Editor, run [`migrations/0001_winterarc.sql`](./migrations/0001_winterarc.sql).
It creates the profile and workout-log tables and policies that let each signed-in
user access only rows whose `user_id` matches their Supabase account.

## Sign-in methods

In **Authentication → Sign In / Providers**, enable Email and Phone. To make
mobile sign-in work, configure an SMS provider in **Project Settings → Auth**
(or the Auth SMS provider settings shown by the dashboard). Add its account
credentials there, not in this repository or Vercel. Supabase's default test
SMS service only sends to configured test numbers; production phone sign-in
requires a real SMS provider and may incur per-message charges.

In **Authentication → URL Configuration**, set the Site URL to the deployed
Winterarc URL and allow the deployed URL and local development URL:

- `https://your-winterarc-domain.example/`
- `https://*.vercel.app/**`
- `http://localhost:8080/`

Email confirmation links should redirect back to the deployed app root. Phone
sign-in verifies an SMS OTP directly in the app.

## Vercel

Import `kunalgursahani/winterarc` into Vercel. A push to `main` deploys
automatically when the GitHub integration is enabled. No Grok auth credentials,
OAuth client secrets, Supabase service-role key, or database URL is required by
this app.
