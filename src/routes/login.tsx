import { useState } from "react";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Snowflake } from "lucide-react";
import { authClient, authEnabled } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/login")({ component: Login });

type LoginMethod = "email" | "phone";

function Login() {
  const { user, isPending, error: sessionError } = useCurrentUserState();
  const [method, setMethod] = useState<LoginMethod>("email");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
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

  const requestPhoneCode = async () => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
        throw new Error("Enter your number with country code, like +14155552671.");
      }
      const { error: authError } = await authClient.auth.signInWithOtp({
        phone,
        options: { shouldCreateUser: true },
      });
      if (authError) throw authError;
      setOtpSent(true);
      setNotice(`A sign-in code was sent to ${phone}.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send the SMS code.");
    } finally {
      setBusy(false);
    }
  };

  const verifyPhoneCode = async () => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const { error: authError } = await authClient.auth.verifyOtp({
        phone,
        token: otp.trim(),
        type: "sms",
      });
      if (authError) throw authError;
      window.location.assign("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "The code could not be verified.");
    } finally {
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
              <div className="grid grid-cols-2 gap-2" aria-label="Sign-in method">
                {(["email", "phone"] as const).map((option) => (
                  <Button
                    key={option}
                    type="button"
                    variant={method === option ? "primary" : "secondary"}
                    aria-pressed={method === option}
                    onClick={() => {
                      setMethod(option);
                      setOtpSent(false);
                      setError(null);
                      setNotice(null);
                    }}
                  >
                    {option === "email" ? "Email" : "Mobile"}
                  </Button>
                ))}
              </div>

              {sessionError && <p className="text-sm text-danger">{sessionError}</p>}

              {method === "email" ? (
                <>
                  <form
                    className="space-y-3"
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
                        onChange={(event) => setEmail(event.target.value)}
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
                        onChange={(event) => setPassword(event.target.value)}
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
                    {mode === "signup"
                      ? "Already have an account? Sign in"
                      : "New here? Create an account"}
                  </button>
                </>
              ) : (
                <form
                  className="space-y-3"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void (otpSent ? verifyPhoneCode() : requestPhoneCode());
                  }}
                >
                  <div>
                    <Label htmlFor="phone">Mobile number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(event) => setPhone(event.target.value.replace(/\s/g, ""))}
                      placeholder="+14155552671"
                      autoComplete="tel"
                      inputMode="tel"
                      disabled={otpSent}
                    />
                    <p className="mt-1 text-xs text-muted">
                      Include your country code, for example +1 or +91.
                    </p>
                  </div>
                  {otpSent && (
                    <div>
                      <Label htmlFor="otp">SMS verification code</Label>
                      <Input
                        id="otp"
                        type="text"
                        required
                        value={otp}
                        onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
                        autoComplete="one-time-code"
                        inputMode="numeric"
                        maxLength={10}
                        autoFocus
                      />
                    </div>
                  )}
                  {error && <p className="text-sm text-danger">{error}</p>}
                  {notice && <p className="text-sm text-muted">{notice}</p>}
                  <Button type="submit" className="w-full" disabled={busy}>
                    {busy
                      ? "Working…"
                      : otpSent
                        ? "Verify code and sign in"
                        : "Send SMS code"}
                  </Button>
                  {otpSent && (
                    <button
                      type="button"
                      className="w-full text-center text-sm text-muted hover:text-fg"
                      disabled={busy}
                      onClick={() => {
                        setOtpSent(false);
                        setOtp("");
                        setError(null);
                        setNotice(null);
                      }}
                    >
                      Change mobile number
                    </button>
                  )}
                </form>
              )}
            </>
          ) : (
            <p className="text-sm text-muted">Sign-in is disabled.</p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
