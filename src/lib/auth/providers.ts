export type OAuthProvider = "google" | "twitter";

export const OAUTH_PROVIDERS: readonly {
  provider: OAuthProvider;
  label: string;
}[] = [
  { provider: "google", label: "Google" },
  { provider: "twitter", label: "X" },
];
