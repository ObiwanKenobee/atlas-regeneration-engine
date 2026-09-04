import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  BASIS_COLOR,
  BASIS_NOTE,
  CONFIDENCE_PCT,
  METRIC_PROVENANCE,
  citationLine,
  provenanceFor,
  type MetricBasis,
} from "@/lib/atlas/provenance";

/** Small inline flag: basis + confidence for a single metric. */
export function BasisFlag({ basis, confidence }: { basis: MetricBasis; confidence: string }) {
  const color = BASIS_COLOR[basis];
  return (
    <span className="label-xs inline-flex items-center gap-1 text-[9px]" style={{ color }}>
      <i className="size-1.5 rounded-full" style={{ background: color }} />
      {basis} · {confidence.toLowerCase()} confidence
    </span>
  );
}

/**
 * Citation affordance attached to a metric. Click to trace the number:
 * definition, method, inputs, caveats and named sources.
 */
export function MetricCite({ id, align = "left" }: { id: string; align?: "left" | "right" }) {
  const [open, setOpen] = useState(false);
  const p = provenanceFor(id);
  if (!p) return null;
  const color = BASIS_COLOR[p.basis];
  return (
    <span className="relative inline-block align-middle">
      <button
        type="button"
        aria-label={`Provenance for ${p.label}`}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex size-3.5 items-center justify-center rounded-full border text-[8px] leading-none transition-colors hover:brightness-125"
        style={{ borderColor: color, color }}
        title={`${p.basis} · ${p.confidence} confidence — click to trace`}
      >
        i
      </button>
      {open && (
        <>
          <span
            className="fixed inset-0 z-40 block cursor-default"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <span
            className={cn(
              "absolute top-5 z-50 block w-[288px] rounded-md border border-border bg-surface-2 p-3 text-left shadow-[0_18px_50px_-12px_rgba(0,0,0,0.8)]",
              align === "right" ? "right-0" : "left-0",
            )}
          >
            <span className="label-xs block text-foreground">{p.label}</span>
            <span className="mt-1 block">
              <BasisFlag basis={p.basis} confidence={p.confidence} />
            </span>
            <span className="mt-2 block h-[3px] w-full overflow-hidden rounded-full bg-muted">
              <span
                className="block h-full rounded-full"
                style={{ width: `${CONFIDENCE_PCT[p.confidence]}%`, background: color }}
              />
            </span>
            <span className="mt-2 block text-[11px] leading-relaxed text-muted-foreground">
              {p.definition}
            </span>
            <span className="label-xs mt-2 block text-[9px] text-primary">Method</span>
            <span className="block text-[11px] leading-relaxed text-muted-foreground">{p.method}</span>
            <span className="label-xs mt-2 block text-[9px] text-primary">Inputs</span>
            <span className="block text-[11px] leading-relaxed text-muted-foreground">
              {p.inputs.join(" · ")}
            </span>
            {p.caveat && (
              <>
                <span className="label-xs mt-2 block text-[9px] text-warn">Caveat</span>
                <span className="block text-[11px] leading-relaxed text-warn/90">{p.caveat}</span>
              </>
            )}
            <span className="label-xs mt-2 block text-[9px] text-primary">Sources</span>
            <span className="block space-y-0.5">
              {p.sources.map((s) => (
                <span key={s.name} className="block text-[11px] leading-relaxed text-muted-foreground">
                  {s.url ? (
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="underline decoration-dotted hover:text-foreground"
                    >
                      {citationLine(s)}
                    </a>
                  ) : (
                    citationLine(s)
                  )}
                </span>
              ))}
            </span>
            <span className="label-xs mt-2 block text-[9px] text-muted-foreground">
              Last updated {p.updated}
            </span>
          </span>
        </>
      )}
    </span>
  );
}

/** Full citation ledger for a panel or view. */
export function CitationPanel({ ids, title = "Data provenance" }: { ids: string[]; title?: string }) {
  const entries = ids.map((id) => METRIC_PROVENANCE[id]).filter(Boolean);
  if (entries.length === 0) return null;
  return (
    <section className="panel rounded-lg">
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
        <span className="label-xs">{title}</span>
        <span className="label-xs text-[9px] text-muted-foreground">{entries.length} metrics traced</span>
      </header>
      <div className="p-4">
        <p className="text-[11px] leading-relaxed text-muted-foreground">{BASIS_NOTE}</p>
        <div className="mt-3 space-y-2">
          {entries.map((p) => (
            <details key={p!.id} className="rounded-sm border border-border bg-surface-2/60 px-3 py-2">
              <summary className="label-xs cursor-pointer list-none select-none">
                <span className="text-foreground">{p!.label}</span>{" "}
                <span style={{ color: BASIS_COLOR[p!.basis] }}>
                  · {p!.basis} · {p!.confidence.toLowerCase()} confidence
                </span>
              </summary>
              <div className="mt-2 space-y-1 text-[11px] leading-relaxed text-muted-foreground">
                <p>{p!.definition}</p>
                <p>
                  <span className="text-foreground">Method. </span>
                  {p!.method}
                </p>
                <p>
                  <span className="text-foreground">Inputs. </span>
                  {p!.inputs.join(" · ")}
                </p>
                {p!.caveat && (
                  <p className="text-warn/90">
                    <span className="text-warn">Caveat. </span>
                    {p!.caveat}
                  </p>
                )}
                <ul className="mt-1 space-y-0.5">
                  {p!.sources.map((s) => (
                    <li key={s.name}>
                      {s.url ? (
                        <a href={s.url} target="_blank" rel="noreferrer" className="underline decoration-dotted hover:text-foreground">
                          {citationLine(s)}
                        </a>
                      ) : (
                        citationLine(s)
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}


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

export function BasisChip({ basis }: { basis: "Reported" | "Estimated" | "Modeled" }) {
  const color =
    basis === "Reported"
      ? "var(--accent)"
      : basis === "Estimated"
        ? "var(--signal-energy)"
        : "var(--signal-compute)";
  return (
    <span
      className="label-xs shrink-0 rounded-sm border px-1.5 py-0.5 text-[9px]"
      style={{ color, borderColor: color, opacity: 0.9 }}
      title={
        basis === "Reported"
          ? "Published by the named source"
          : basis === "Estimated"
            ? "Atlas estimate from partial public data"
            : "Model output, not a measurement"
      }
    >
      {basis}
    </span>
  );
}

export function FactList({
  facts,
  note,
}: {
  facts: Array<{
    label: string;
    value: string;
    note?: string;
    basis: "Reported" | "Estimated" | "Modeled";
    source: string;
    year: number;
  }>;
  note?: string;
}) {
  if (facts.length === 0) {
    return (
      <p className="text-[12px] text-muted-foreground">
        No verified statistics are published for this geography yet. Atlas shows nothing rather than
        inventing a number.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      {facts.map((f) => (
        <div key={f.label} className="border-b border-border pb-2.5 last:border-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="label-xs">{f.label}</div>
              <div className="num mt-0.5 text-[15px] text-foreground">{f.value}</div>
            </div>
            <BasisChip basis={f.basis} />
          </div>
          {f.note && <div className="mt-1 text-[11px] text-muted-foreground">{f.note}</div>}
          <div className="label-xs mt-1 text-[9px] text-muted-foreground">
            {f.source} · {f.year}
          </div>
        </div>
      ))}
      {note && <p className="text-[10px] leading-relaxed text-muted-foreground">{note}</p>}
    </div>
  );
}
