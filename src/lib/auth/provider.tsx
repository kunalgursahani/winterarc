import type { ReactNode } from "react";

/** Stable app-wide provider mount retained by the root document shell. */
export function AuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
