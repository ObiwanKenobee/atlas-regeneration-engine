import { useState } from "react";
import { SYSTEM_BY_ID, type Asset } from "@/lib/atlas/data";

export function DependencyGraph({ asset }: { asset: Asset }) {
  const [failed, setFailed] = useState<string | null>(null);
  const [stress, setStress] = useState(false);
  const deps = asset.dependencies;
  const size = 420;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 96;

  return (
    <div>
      <div className="relative">
        <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto w-full max-w-[460px]">
          {deps.map((d, i) => {
            const a = (Math.PI * 2 * i) / deps.length - Math.PI / 2;
            const x = Math.round((cx + Math.cos(a) * r) * 100) / 100;
            const y = Math.round((cy + Math.sin(a) * r) * 100) / 100;
            const color = SYSTEM_BY_ID[d.system].colorVar;
            const broken = failed === d.label;
            const crit = stress ? Math.min(100, d.criticality * 1.25) : d.criticality;
            return (
              <g key={d.label} onClick={() => setFailed(broken ? null : d.label)} className="cursor-pointer">
                <line
                  x1={cx}
                  y1={cy}
                  x2={x}
                  y2={y}
                  stroke={broken ? "var(--danger)" : color}
                  strokeWidth={broken ? 2.4 : Math.round((0.6 + crit / 55) * 100) / 100}
                  strokeOpacity={broken ? 0.95 : 0.55}
                  strokeDasharray="4 6"
                  style={{ animation: `atlas-dash ${broken ? 2 : Math.round((12 - crit / 12) * 100) / 100}s linear infinite` }}
                />
                <circle cx={x} cy={y} r={Math.round((5 + crit / 26) * 100) / 100} fill={broken ? "var(--danger)" : color} fillOpacity="0.9" />
                <text
                  x={x + (x > cx ? 10 : -10)}
                  y={y + 3}
                  textAnchor={x > cx ? "start" : "end"}
                  fontSize="9"
                  fill="var(--foreground)"
                  style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.08em" }}
                >
                  {d.label.toUpperCase()}
                </text>
              </g>
            );
          })}
          <circle cx={cx} cy={cy} r="42" fill="var(--surface-2)" stroke="var(--primary)" strokeWidth="1.5" />
          <circle cx={cx} cy={cy} r="54" fill="none" stroke="var(--primary)" strokeWidth="0.6" strokeOpacity="0.4" style={{ animation: "atlas-pulse 3.5s ease-in-out infinite" }} />
          <text x={cx} y={cy - 4} textAnchor="middle" fontSize="10" fill="var(--primary)" style={{ fontFamily: "var(--font-mono)" }}>
            {asset.type.toUpperCase()}
          </text>
          <text x={cx} y={cy + 12} textAnchor="middle" fontSize="8" fill="var(--muted-foreground)" style={{ fontFamily: "var(--font-mono)" }}>
            {asset.scale}
          </text>
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => setFailed(deps[0]?.label ?? null)}
          className="label-xs rounded-sm border border-border px-3 py-2 text-foreground hover:border-danger/60"
        >
          What happens if this system fails?
        </button>
        <button
          onClick={() => setStress((s) => !s)}
          className="label-xs rounded-sm border border-border px-3 py-2 text-foreground hover:border-warn/60"
        >
          {stress ? "Reset demand" : "What happens if demand doubles?"}
        </button>
      </div>

      {failed && (
        <div className="animate-rise mt-3 rounded-sm border border-danger/40 bg-danger/8 p-3 text-sm">
          <div className="label-xs text-danger">Failure propagation · {failed}</div>
          <p className="mt-2 text-muted-foreground">
            {deps.find((d) => d.label === failed)?.note} Criticality{" "}
            {deps.find((d) => d.label === failed)?.criticality}/100 — at this level the asset cannot
            hold its service commitment, and downstream systems degrade within hours to days.
          </p>
        </div>
      )}
      {stress && (
        <div className="animate-rise mt-3 rounded-sm border border-warn/40 bg-warn/8 p-3 text-sm">
          <div className="label-xs text-warn">Demand doubling · modelled</div>
          <p className="mt-2 text-muted-foreground">
            Every dependency criticality rises ~25%. The binding constraints become electricity
            supply and water/cooling before capital. Expect a new requirement for firm generation,
            a second transmission feed, and cooling redesign toward closed-loop.
          </p>
        </div>
      )}
      <p className="label-xs mt-3">Click any node to model its failure · line weight ∝ criticality</p>
    </div>
  );
}
