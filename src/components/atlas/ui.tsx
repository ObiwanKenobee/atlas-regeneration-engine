import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({
  children,
  className,
  label,
  right,
}: {
  children: ReactNode;
  className?: string;
  label?: string;
  right?: ReactNode;
}) {
  return (
    <section className={cn("panel rounded-lg", className)}>
      {(label || right) && (
        <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
          <span className="label-xs">{label}</span>
          {right}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function Stat({
  label,
  value,
  unit,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  unit?: string;
  hint?: string;
  tone?: "default" | "good" | "warn" | "danger" | "primary";
}) {
  const color =
    tone === "good"
      ? "text-good"
      : tone === "warn"
        ? "text-warn"
        : tone === "danger"
          ? "text-danger"
          : tone === "primary"
            ? "text-primary"
            : "text-foreground";
  return (
    <div className="min-w-0">
      <div className="label-xs truncate">{label}</div>
      <div className={cn("num mt-1 text-xl leading-none tracking-tight", color)}>
        {value}
        {unit && <span className="ml-1 text-[11px] text-muted-foreground">{unit}</span>}
      </div>
      {hint && <div className="mt-1 text-[11px] leading-snug text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function Meter({
  label,
  value,
  max = 100,
  color = "var(--primary)",
  suffix,
}: {
  label: string;
  value: number;
  max?: number;
  color?: string;
  suffix?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="label-xs">{label}</span>
        <span className="num text-xs text-foreground">
          {value}
          {suffix ?? ""}
        </span>
      </div>
      <div className="mt-1.5 h-[3px] w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color, boxShadow: `0 0 10px ${color}` }}
        />
      </div>
    </div>
  );
}

export function Chip({
  children,
  active,
  onClick,
  color,
  className,
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  color?: string;
  className?: string;
}) {
  const Comp = onClick ? "button" : "span";
  return (
    <Comp
      onClick={onClick}
      className={cn(
        "label-xs inline-flex items-center gap-1.5 rounded-sm border px-2 py-1 transition-colors",
        active
          ? "border-primary/60 bg-primary/12 text-foreground"
          : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
        className,
      )}
    >
      {color && (
        <i
          className="size-1.5 rounded-full"
          style={{ background: color, boxShadow: active ? `0 0 8px ${color}` : undefined }}
        />
      )}
      {children}
    </Comp>
  );
}

export function ActionButton({
  children,
  onClick,
  variant = "primary",
  className,
  type = "button",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "accent";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "label-xs inline-flex items-center justify-center gap-2 rounded-sm px-3.5 py-2.5 transition-all disabled:opacity-40",
        variant === "primary" &&
          "bg-primary text-primary-foreground hover:brightness-110 shadow-[0_0_24px_-6px_var(--primary)]",
        variant === "accent" &&
          "bg-accent text-accent-foreground hover:brightness-110 shadow-[0_0_24px_-6px_var(--accent)]",
        variant === "ghost" &&
          "border border-border bg-surface-2 text-foreground hover:border-primary/50",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between gap-2">
        <span className="label-xs">{label}</span>
        <span className="num text-xs text-primary">
          {value}
          {suffix ? ` ${suffix}` : ""}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-1 w-full cursor-pointer appearance-none rounded-full bg-muted accent-[var(--primary)]"
        style={{
          background: `linear-gradient(to right, var(--primary) ${((value - min) / (max - min)) * 100}%, var(--muted) ${((value - min) / (max - min)) * 100}%)`,
        }}
      />
    </label>
  );
}

export function ProvenanceTag({
  method,
  confidence,
  source,
  year,
}: {
  method: string;
  confidence: string;
  source: string;
  year?: number;
}) {
  return (
    <details className="group mt-3 rounded-sm border border-border bg-surface-2/60 px-3 py-2">
      <summary className="label-xs cursor-pointer list-none select-none">
        <span className="text-primary">{method}</span> · confidence {confidence} ·{" "}
        <span className="underline decoration-dotted">provenance</span>
      </summary>
      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
        {source}
        {year ? ` · ${year}` : ""}. Atlas does not present modelled output as observed fact. Where
        confidence is low, treat the value as a hypothesis to be tested, not a measurement.
      </p>
    </details>
  );
}

export function SectionTitle({ kicker, title, sub }: { kicker?: string; title: string; sub?: string }) {
  return (
    <div className="mb-5">
      {kicker && <div className="label-xs text-primary">{kicker}</div>}
      <h2 className="mt-1.5 font-display text-2xl leading-tight tracking-tight">{title}</h2>
      {sub && <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{sub}</p>}
    </div>
  );
}
