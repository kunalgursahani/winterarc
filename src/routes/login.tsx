import { useState } from "react";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Snowflake } from "lucide-react";
import { authClient, authEnabled, signIn } from "@/lib/auth/client";
import { OAUTH_PROVIDERS } from "@/lib/auth/providers";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const { user, isPending, error: sessionError } = useCurrentUserState();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (isPending) {
    return (
      <main className="grid min-h-screen place-items-center bg-bg p-6">
        <Skeleton className="h-64 w-full max-w-sm" />
      </main>
    );
  }
  if (user) return <Navigate to="/" />;

  const submitEmail = async () => {
    setBusy(true);
    setError(null);
    try {
      if (mode === "signup") {
        const res = await authClient.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name.trim() || email.split("@")[0] },
            emailRedirectTo: window.location.origin,
          },
        });
        if (res.error) throw res.error;
        if (!res.data.session) {
          setNotice("Check your email to confirm your account, then sign in.");
          setBusy(false);
          return;
        }
      } else {
        const res = await authClient.auth.signInWithPassword({ email, password });
        if (res.error) throw res.error;
      }
      window.location.assign("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setBusy(false);
    }
  };

  const signInWithProvider = async (provider: "google" | "twitter") => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await signIn(provider);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed");
      setBusy(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-bg px-4 py-10">
      <Card className="w-full max-w-sm p-6">
        <CardContent className="space-y-5 p-0">
          <div className="text-center">
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-lg border border-border bg-surface-2">
              <Snowflake className="h-5 w-5 text-accent" />
            </div>
            <h1 className="font-display text-2xl font-medium tracking-tight">Winterarc</h1>
            <p className="mt-1 text-sm text-muted">Sign in to sync logs across devices</p>
          </div>

          {authEnabled ? (
            <>
              {sessionError && <p className="text-sm text-danger">{sessionError}</p>}
              <div className="space-y-2">
                {OAUTH_PROVIDERS.map((p) => (
                  <Button
                    key={p.provider}
                    type="button"
                    variant="secondary"
                    className="w-full"
                    disabled={busy}
                    onClick={() => void signInWithProvider(p.provider)}
                  >
                    Continue with {p.label}
                  </Button>
                ))}
              </div>

              <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-subtle">
                <span className="h-px flex-1 bg-border" />
                or email and password
                <span className="h-px flex-1 bg-border" />
              </div>

              <form
                className="space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  void submitEmail();
                }}
              >
                {mode === "signup" && (
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  />
                </div>
                {error && <p className="text-sm text-danger">{error}</p>}
                {notice && <p className="text-sm text-muted">{notice}</p>}
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? "Working…" : mode === "signup" ? "Create account" : "Sign in"}
                </Button>
              </form>
              <button
                type="button"
                className="w-full text-center text-sm text-muted hover:text-fg"
                onClick={() => {
                  setMode(mode === "signup" ? "signin" : "signup");
                  setError(null);
                  setNotice(null);
                }}
              >
                {mode === "signup" ? "Already have an account? Sign in" : "New here? Create an account"}
              </button>
            </>
          ) : (
            <p className="text-sm text-muted">Sign-in is disabled.</p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
