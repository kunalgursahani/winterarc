import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Instagram, MessageCircle, Palette, Share2, Sparkles, Snowflake } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import type { DailyLog, UserGoals } from "@/lib/types";
import { getLoggedDates, getWorkoutStats } from "@/lib/stats";
import { cn } from "@/lib/utils";

interface Props {
  logs: DailyLog[];
  goals: UserGoals;
}

type ThemeId = "dark-ice" | "monk-gold" | "cyber-neon" | "frozen-steel";

const THEMES: { id: ThemeId; name: string; bgClass: string; accentClass: string; borderClass: string; textAccent: string }[] = [
  {
    id: "dark-ice",
    name: "Dark Ice (Classic)",
    bgClass: "from-[#0a0f1d] via-[#0d1527] to-[#060913]",
    accentClass: "from-sky-400 to-cyan-500",
    borderClass: "border-sky-500/30",
    textAccent: "text-sky-400",
  },
  {
    id: "monk-gold",
    name: "Monk Gold",
    bgClass: "from-[#14120e] via-[#1a1712] to-[#0a0907]",
    accentClass: "from-amber-400 to-yellow-500",
    borderClass: "border-amber-500/30",
    textAccent: "text-amber-400",
  },
  {
    id: "cyber-neon",
    name: "Cyber Neon",
    bgClass: "from-[#110926] via-[#160d33] to-[#090417]",
    accentClass: "from-cyan-400 via-indigo-400 to-fuchsia-500",
    borderClass: "border-fuchsia-500/30",
    textAccent: "text-fuchsia-400",
  },
  {
    id: "frozen-steel",
    name: "Frozen Titanium",
    bgClass: "from-[#151921] via-[#1c222e] to-[#0e1218]",
    accentClass: "from-emerald-400 to-teal-400",
    borderClass: "border-teal-500/30",
    textAccent: "text-teal-400",
  },
];

export function ShareCardGenerator({ logs, goals }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [themeId, setThemeId] = useState<ThemeId>("dark-ice");
  const [handle, setHandle] = useState("@winter_athlete");
  const [headline, setHeadline] = useState("Execute in Silence. Build in Cold.");
  const [copied, setCopied] = useState(false);

  const loggedDays = useMemo(() => getLoggedDates(logs).size, [logs]);
  const stats = useMemo(() => getWorkoutStats(logs), [logs]);

  // Determine discipline rank
  const rank = useMemo(() => {
    if (loggedDays >= 25) return "Winter Sovereign";
    if (loggedDays >= 12) return "Iron Monk";
    if (loggedDays >= 5) return "Cold Warrior";
    return "Novice Arc";
  }, [loggedDays]);

  // Find top PR
  const topPr = useMemo(() => {
    let bestEx = "Bench Press";
    let maxVal = 0;

    logs.forEach((l) => {
      if (!l.prs) return;
      Object.entries(l.prs).forEach(([ex, val]) => {
        if (typeof val === "number" && val > maxVal) {
          maxVal = val;
          bestEx = ex.replace(/\(.*\)/, "").trim();
        }
      });
    });

    return maxVal > 0 ? `${bestEx}: ${maxVal}kg` : "Consistent Logging";
  }, [logs]);

  const currentTheme = THEMES.find((t) => t.id === themeId) ?? THEMES[0];

  // Draw card on HTML5 canvas for export
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 1080;
    const height = 1350;
    canvas.width = width;
    canvas.height = height;

    // Background Gradients
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    if (themeId === "dark-ice") {
      bgGrad.addColorStop(0, "#0a0f1d");
      bgGrad.addColorStop(0.5, "#0d1527");
      bgGrad.addColorStop(1, "#060913");
    } else if (themeId === "monk-gold") {
      bgGrad.addColorStop(0, "#14120e");
      bgGrad.addColorStop(0.5, "#1a1712");
      bgGrad.addColorStop(1, "#0a0907");
    } else if (themeId === "cyber-neon") {
      bgGrad.addColorStop(0, "#110926");
      bgGrad.addColorStop(0.5, "#160d33");
      bgGrad.addColorStop(1, "#090417");
    } else {
      bgGrad.addColorStop(0, "#151921");
      bgGrad.addColorStop(0.5, "#1c222e");
      bgGrad.addColorStop(1, "#0e1218");
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle Glow circles
    const glowGrad = ctx.createRadialGradient(width * 0.8, height * 0.2, 50, width * 0.8, height * 0.2, 450);
    if (themeId === "dark-ice") glowGrad.addColorStop(0, "rgba(56, 189, 248, 0.15)");
    else if (themeId === "monk-gold") glowGrad.addColorStop(0, "rgba(251, 191, 36, 0.15)");
    else if (themeId === "cyber-neon") glowGrad.addColorStop(0, "rgba(217, 70, 239, 0.18)");
    else glowGrad.addColorStop(0, "rgba(45, 212, 191, 0.15)");
    glowGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, width, height);

    // Outer Border
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 16;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    // Inner Card Shell
    ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
    ctx.fillRect(80, 80, width - 160, height - 160);

    // Header Logo & Title
    ctx.fillStyle = "#ffffff";
    ctx.font = "600 32px Figtree, sans-serif";
    ctx.letterSpacing = "6px";
    ctx.fillText("WINTER ARC", 130, 160);

    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.font = "400 20px Figtree, sans-serif";
    ctx.letterSpacing = "3px";
    ctx.fillText("OCTOBER — DECEMBER 2026", 130, 195);

    // User Handle
    ctx.fillStyle = themeId === "monk-gold" ? "#fbbf24" : themeId === "cyber-neon" ? "#e879f9" : "#38bdf8";
    ctx.font = "600 28px Figtree, sans-serif";
    ctx.fillText(handle || "@winter_athlete", 130, 260);

    // Quote / Headline
    ctx.fillStyle = "#ffffff";
    ctx.font = "600 48px Fraunces, serif";
    ctx.letterSpacing = "0px";
    
    // Wrap headline text
    const words = (headline || "Execute in Silence.").split(" ");
    let line = "";
    let y = 350;
    words.forEach((w) => {
      const testLine = line + w + " ";
      if (ctx.measureText(testLine).width > width - 260 && line !== "") {
        ctx.fillText(`“${line.trim()}”`, 130, y);
        line = w + " ";
        y += 65;
      } else {
        line = testLine;
      }
    });
    ctx.fillText(`“${line.trim()}”`, 130, y);

    // Primary Stat Boxes (2x2 Grid)
    const boxY = y + 70;
    const boxW = 410;
    const boxH = 200;

    // Stat Box 1: Days Logged
    drawStatBox(ctx, 130, boxY, boxW, boxH, "DAYS LOGGED", String(loggedDays), "DAYS RECORDED");
    // Stat Box 2: Sessions
    drawStatBox(ctx, 570, boxY, boxW, boxH, "WORKOUT SESSIONS", String(stats.totalWorkouts), "SESSIONS FINISHED");

    // Stat Box 3: Discipline Rank
    drawStatBox(ctx, 130, boxY + 230, boxW, boxH, "DISCIPLINE RANK", rank, "CURRENT LEVEL");
    // Stat Box 4: Key PR
    drawStatBox(ctx, 570, boxY + 230, boxW, boxH, "TOP RECORD / BEST", topPr, "ALL-TIME BEST");

    // Footer Watermark
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "500 22px Figtree, sans-serif";
    ctx.letterSpacing = "2px";
    ctx.fillText("GENERATED WITH WINTER ARC JOURNAL", 130, height - 120);

    ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
    ctx.fillText("❄️ UNSTOPPABLE CONSISTENCY", width - 480, height - 120);
  }, [themeId, handle, headline, loggedDays, stats, rank, topPr]);

  function drawStatBox(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, label: string, val: string, sub: string) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
    ctx.fillRect(x, y, w, h);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.font = "500 18px Figtree, sans-serif";
    ctx.letterSpacing = "2px";
    ctx.fillText(label, x + 30, y + 50);

    ctx.fillStyle = "#ffffff";
    ctx.font = "700 44px Figtree, sans-serif";
    ctx.letterSpacing = "0px";
    ctx.fillText(val, x + 30, y + 120);

    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    ctx.font = "400 16px Figtree, sans-serif";
    ctx.fillText(sub, x + 30, y + 160);
  }

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const getShareText = () => {
    return (
      `❄️ WINTER ARC UPDATE ❄️\n` +
      `👤 ${handle || "@winter_athlete"}\n` +
      `🔥 Days Logged: ${loggedDays} Days\n` +
      `🏋️ Sessions Finished: ${stats.totalWorkouts}\n` +
      `🏅 Rank: ${rank}\n` +
      `🏆 Top Record: ${topPr}\n` +
      `“${headline || "Execute in Silence."}”\n` +
      `Logged on Winter Arc Journal`
    );
  };

  // WhatsApp Share Direct Action
  const shareOnWhatsApp = async () => {
    const text = getShareText();
    const canvas = canvasRef.current;

    if (navigator.share && canvas && canvas.toBlob) {
      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], "winter_arc_card.png", { type: "image/png" });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                title: "My Winter Arc Progress",
                text: text,
                files: [file],
              });
              return;
            } catch {
              // Fallback to web link below
            }
          }
        }
        const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
        window.open(waUrl, "_blank");
      });
    } else {
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
      window.open(waUrl, "_blank");
    }
  };

  // Instagram Share Direct Action
  const shareOnInstagram = async () => {
    const canvas = canvasRef.current;
    const text = getShareText();

    if (navigator.share && canvas && canvas.toBlob) {
      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], "winter_arc_card.png", { type: "image/png" });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                title: "My Winter Arc Progress",
                text: text,
                files: [file],
              });
              return;
            } catch {
              // Fallback below
            }
          }
        }
        // Fallback: copy image to clipboard and open Instagram
        await copyImageToClipboard();
        window.open("https://www.instagram.com/", "_blank");
      });
    } else {
      await copyImageToClipboard();
      window.open("https://www.instagram.com/", "_blank");
    }
  };

  const copyImageToClipboard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } catch {
      // Ignore copy error
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-accent/30 bg-gradient-to-br from-surface to-bg p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent">
              <Share2 className="h-4 w-4" />
              Winter Arc Social Share
            </div>
            <h2 className="mt-2 font-display text-2xl font-medium text-fg sm:text-3xl">
              Share Directly on WhatsApp & Instagram
            </h2>
            <p className="mt-1 text-xs text-muted">
              Instantly broadcast your Winter Arc progress card and stats directly to your friends & followers.
            </p>
          </div>
          <Badge tone="info" className="self-start sm:self-auto">
            Direct Share Enabled
          </Badge>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Customization Controls & Direct Share Buttons */}
        <Card className="lg:col-span-5 space-y-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Palette className="h-4 w-4 text-accent" />
              Card Customizer & Share
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Theme Selector */}
            <div>
              <Label className="text-xs font-medium text-subtle">Theme & Aesthetics</Label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setThemeId(t.id)}
                    className={cn(
                      "flex items-center gap-2 rounded-md border p-2.5 text-xs font-medium transition-all text-left",
                      themeId === t.id
                        ? "border-accent bg-surface-2 text-fg shadow-sm"
                        : "border-border bg-bg text-muted hover:text-fg",
                    )}
                  >
                    <span className={cn("h-3 w-3 rounded-full bg-gradient-to-r", t.accentClass)} />
                    <span className="truncate">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Handle / Name Input */}
            <div>
              <Label className="text-xs font-medium text-subtle">Handle or Name</Label>
              <Input
                placeholder="@your_handle"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                className="mt-1.5"
              />
            </div>

            {/* Custom Headline Quote */}
            <div>
              <Label className="text-xs font-medium text-subtle">Custom Creed / Headline</Label>
              <Input
                placeholder="Execute in Silence."
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="mt-1.5"
              />
            </div>

            {/* Direct Share Buttons */}
            <div className="pt-2 space-y-2.5">
              {/* WhatsApp Button */}
              <button
                type="button"
                onClick={shareOnWhatsApp}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-[#25D366] px-4 py-3 font-semibold text-white transition-all hover:bg-[#20bd5a] shadow-md"
              >
                <MessageCircle className="h-5 w-5 fill-current" />
                Share on WhatsApp
              </button>

              {/* Instagram Button */}
              <button
                type="button"
                onClick={shareOnInstagram}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] px-4 py-3 font-semibold text-white transition-all hover:opacity-95 shadow-md"
              >
                <Instagram className="h-5 w-5" />
                Share on Instagram
              </button>

              {/* Copy Clipboard Button */}
              <Button onClick={copyImageToClipboard} variant="secondary" className="w-full mt-1">
                {copied ? <Check className="h-4 w-4 mr-2 text-emerald-400" /> : <Copy className="h-4 w-4 mr-2" />}
                {copied ? "Card Image Copied!" : "Copy Card Image to Clipboard"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Live Card Preview */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full max-w-sm overflow-hidden rounded-xl border border-border shadow-2xl transition-all">
            {/* Styled HTML Card Preview */}
            <div
              className={cn(
                "relative flex aspect-[4/5] w-full flex-col justify-between p-6 bg-gradient-to-br text-fg",
                currentTheme.bgClass,
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 font-display text-sm font-semibold tracking-[0.2em]">
                    <Snowflake className="h-4 w-4 text-accent" />
                    WINTER ARC
                  </div>
                  <p className="text-[9px] uppercase tracking-[0.16em] text-subtle">Oct — Dec 2026</p>
                </div>
                <span className={cn("text-xs font-semibold font-mono", currentTheme.textAccent)}>
                  {handle || "@winter_athlete"}
                </span>
              </div>

              {/* Quote */}
              <div className="my-4">
                <blockquote className="font-display text-xl font-medium leading-snug tracking-tight">
                  “{headline || "Execute in Silence."}”
                </blockquote>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <span className="text-[9px] font-medium uppercase tracking-wider text-subtle">Days Logged</span>
                  <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-fg">{loggedDays}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <span className="text-[9px] font-medium uppercase tracking-wider text-subtle">Sessions</span>
                  <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-fg">{stats.totalWorkouts}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <span className="text-[9px] font-medium uppercase tracking-wider text-subtle">Discipline Rank</span>
                  <p className={cn("mt-1 text-xs font-bold uppercase tracking-wider", currentTheme.textAccent)}>
                    {rank}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <span className="text-[9px] font-medium uppercase tracking-wider text-subtle">Top Record</span>
                  <p className="mt-1 text-xs font-bold text-fg truncate">{topPr}</p>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[9px] uppercase tracking-wider text-subtle">
                <span>Winter Arc Journal</span>
                <span className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-accent" /> Unstoppable
                </span>
              </div>
            </div>
          </div>

          <p className="mt-3 text-xs text-subtle">Live Card Preview</p>

          {/* Hidden Canvas for crisp high-resolution export */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    </div>
  );
}
