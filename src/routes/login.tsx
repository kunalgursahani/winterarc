import { useState } from "react";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Activity, ArrowUpRight, CalendarDays, LockKeyhole, Snowflake } from "lucide-react";
import { authClient, authEnabled } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Button } from "@/components/ui/button";
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
    setNotice(null);
    try {
      if (mode === "signup") {
        const { data, error: authError } = await authClient.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name.trim() || email.split("@")[0] },
          },
        });
        if (authError) throw authError;
        if (!data.session) {
          setNotice("Check your email to confirm your account, then sign in.");
          return;
        }
      } else {
        const { error: authError } = await authClient.auth.signInWithPassword({
          email,
          password,
        });
        if (authError) throw authError;
      }
      window.location.assign("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-svh bg-bg sm:grid sm:place-items-center sm:px-6 sm:py-8 lg:px-10">
      <section className="mx-auto grid min-h-svh w-full max-w-7xl overflow-hidden bg-surface sm:min-h-[min(48rem,calc(100svh-4rem))] sm:rounded-xl sm:border sm:border-border sm:shadow-[0_24px_80px_rgba(0,0,0,0.3)] lg:grid-cols-[1.08fr_0.92fr]">
        <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-bg px-12 py-10 lg:flex xl:px-16 xl:py-12">
          <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-border-strong to-transparent" />
          <a href="/" className="relative flex w-fit items-center gap-3 text-fg">
            <span className="grid h-10 w-10 place-items-center rounded-md border border-border bg-surface">
              <Snowflake className="h-4 w-4 text-accent" />
            </span>
            <span className="font-display text-xl tracking-[0.08em]">WINTER ARC</span>
          </a>

          <div className="relative max-w-xl py-12">
            <p className="mb-6 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.22em] text-muted">
              <span className="h-px w-8 bg-accent/60" />
              Your private training journal
            </p>
            <h2 className="max-w-lg font-display text-5xl font-medium leading-[1.08] tracking-tight text-fg xl:text-6xl">
              Progress, with a little more <span className="text-muted">purpose.</span>
            </h2>
            <p className="mt-6 max-w-md text-base leading-7 text-muted">
              Make room for the work behind the results. A considered place to track your training,
              your habits, and the details that matter.
            </p>

            <div className="mt-12 max-w-lg border-t border-border">
              <div className="flex items-start gap-4 border-b border-border py-5">
                <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <div>
                  <p className="text-sm font-medium text-fg">A clear daily record</p>
                  <p className="mt-1 text-sm leading-6 text-subtle">
                    Training, movement, and nutrition in one calm view.
                  </p>
                </div>
                <span className="ml-auto font-mono text-xs text-subtle">01</span>
              </div>
              <div className="flex items-start gap-4 border-b border-border py-5">
                <Activity className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <div>
                  <p className="text-sm font-medium text-fg">Progress you can understand</p>
                  <p className="mt-1 text-sm leading-6 text-subtle">
                    Thoughtful trends that reward consistency, not perfection.
                  </p>
                </div>
                <span className="ml-auto font-mono text-xs text-subtle">02</span>
              </div>
              <div className="flex items-start gap-4 py-5">
                <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <div>
                  <p className="text-sm font-medium text-fg">Yours, by design</p>
                  <p className="mt-1 text-sm leading-6 text-subtle">
                    Your journal is private to your account.
                  </p>
                </div>
                <span className="ml-auto font-mono text-xs text-subtle">03</span>
              </div>
            </div>
          </div>

          <p className="relative text-xs uppercase tracking-[0.18em] text-subtle">
            A quieter way to move forward <span className="mx-2 text-border-strong">/</span> Est. 2026
          </p>
        </aside>

        <div className="flex flex-col px-6 py-8 sm:px-10 sm:py-10 lg:justify-center lg:px-14 xl:px-20">
          <a href="/" className="mb-12 flex w-fit items-center gap-3 text-fg lg:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-md border border-border bg-bg">
              <Snowflake className="h-4 w-4 text-accent" />
            </span>
            <span className="font-display text-xl tracking-[0.08em]">WINTER ARC</span>
          </a>

          <div className="mx-auto w-full max-w-md">
            <div className="mb-8">
              <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.2em] text-subtle">
                {mode === "signup" ? "Begin your journal" : "Member access"}
              </p>
              <h1 className="font-display text-4xl font-medium tracking-tight text-fg sm:text-5xl">
                {mode === "signup" ? "Start with today." : "Welcome back."}
              </h1>
              <p className="mt-3 max-w-sm text-sm leading-6 text-muted">
                {mode === "signup"
                  ? "Create your private space for steady, intentional progress."
                  : "Pick up where you left off. Your season is waiting."}
              </p>
            </div>

            {authEnabled ? (
              <>
                {sessionError && (
                  <p className="mb-4 rounded-md border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
                    {sessionError}
                  </p>
                )}

                <form
                  className="space-y-5"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void submitEmail();
                  }}
                >
                  {mode === "signup" && (
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        autoComplete="name"
                        placeholder="How should we address you?"
                      />
                    </div>
                  )}
                  <div>
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      autoComplete="email"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <Label htmlFor="password" className="mb-0">Password</Label>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete={mode === "signup" ? "new-password" : "current-password"}
                      placeholder="At least 8 characters"
                    />
                  </div>
                  {error && (
                    <p role="alert" className="rounded-md border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
                      {error}
                    </p>
                  )}
                  {notice && (
                    <p role="status" className="rounded-md border border-border bg-surface-2 p-3 text-sm text-muted">
                      {notice}
                    </p>
                  )}
                  <Button type="submit" className="group mt-2 w-full justify-between px-5" disabled={busy}>
                    <span>{busy ? "Working…" : mode === "signup" ? "Create your account" : "Sign in to WINTER ARC"}</span>
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Button>
                </form>
                <div className="my-7 flex items-center gap-4">
                  <span className="h-px flex-1 bg-border" />
                  <span className="text-[10px] uppercase tracking-[0.18em] text-subtle">
                    {mode === "signup" ? "Already a member?" : "New to WINTER ARC?"}
                  </span>
                  <span className="h-px flex-1 bg-border" />
                </div>
                <button
                  type="button"
                  className="flex min-h-11 w-full items-center justify-center rounded-md border border-border px-4 text-sm font-medium text-muted transition-colors hover:border-border-strong hover:text-fg"
                  onClick={() => {
                    setMode(mode === "signup" ? "signin" : "signup");
                    setError(null);
                    setNotice(null);
                  }}
                >
                  {mode === "signup" ? "Sign in to your account" : "Create a private account"}
                </button>
              </>
            ) : (
              <p className="text-sm text-muted">Sign-in is disabled.</p>
            )}
            <p className="mt-8 flex items-center justify-center gap-2 text-xs text-subtle">
              <LockKeyhole className="h-3.5 w-3.5" />
              Private by design. Securely synced to your account.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
