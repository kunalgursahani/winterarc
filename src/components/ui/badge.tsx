import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: "default" | "success" | "warn" | "info" }) {
  const tones = {
    default: "border-border text-muted",
    success: "border-success/40 text-success",
    warn: "border-warn/40 text-warn",
    info: "border-border-strong text-fg",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
