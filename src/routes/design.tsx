import { useMemo, useState } from "react";
import { z } from "zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/atlas/Shell";
import { CapitalsRadar } from "@/components/atlas/CapitalsRadar";
import { ActionButton, Chip, Panel, ProvenanceTag, SectionTitle, Stat } from "@/components/atlas/ui";
import { DESIGN_COMPONENTS, PLACES, PLACE_BY_ID, SEVEN_CAPITALS, SYSTEM_BY_ID } from "@/lib/atlas/data";
import { designTotals, fmtNum, fmtUsdM, integrityAssessment, type DesignItem } from "@/lib/atlas/model";

export const Route = createFileRoute("/design")({
  validateSearch: z.object({ place: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Design Studio — Infrastructure Interventions | Atlas Sanctum" },
      {
        name: "description",
        content:
          "Compose infrastructure interventions from modular components and see dependencies, capital, resource requirements and seven-capital effects in real time.",
      },
      { property: "og:title", content: "Infrastructure Design Studio" },
      {
        property: "og:description",
        content: "AI-assisted infrastructure design evaluated across seven forms of capital.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DesignStudio,
});

function DesignStudio() {
  const search = Route.useSearch();
  const [placeId, setPlaceId] = useState(search.place ?? "nairobi");
  const [selected, setSelected] = useState(DESIGN_COMPONENTS[0]!.id);
  const [items, setItems] = useState<DesignItem[]>([]);

  const place = PLACE_BY_ID[placeId] ?? PLACES[0]!;
  const totals = useMemo(() => designTotals(items, placeId), [items, placeId]);
  const integrity = integrityAssessment(totals.capitals, totals.co2Tpa);

  const place_click = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setItems((prev) => [
      ...prev,
      { id: `${selected}-${Date.now()}`, componentId: selected, count: 1, x, y },
    ]);
  };

  return (
    <Shell>
      <SectionTitle
        kicker="Design"
        title="Infrastructure design studio"
        sub="Place components on the site canvas. Atlas computes dependencies, resource requirements, capital and what is missing."
      />

      <div className="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)_360px]">
        <aside className="space-y-3">
          <Panel label="Place">
            <div className="flex flex-wrap gap-1.5">
              {PLACES.filter((p) => p.id !== "world").map((p) => (
                <Chip key={p.id} active={p.id === placeId} onClick={() => setPlaceId(p.id)}>
                  {p.name}
                </Chip>
              ))}
            </div>
          </Panel>
          <Panel label="Components">
            <div className="flex flex-wrap gap-1.5">
              {DESIGN_COMPONENTS.map((c) => (
                <Chip
                  key={c.id}
                  color={SYSTEM_BY_ID[c.system].colorVar}
                  active={selected === c.id}
                  onClick={() => setSelected(c.id)}
                >
                  {c.label}
                </Chip>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Selected unit:{" "}
              <span className="num text-foreground">
                {DESIGN_COMPONENTS.find((c) => c.id === selected)?.unit}
              </span>{" "}
              · {fmtUsdM(DESIGN_COMPONENTS.find((c) => c.id === selected)?.capexPerUnitUsdM ?? 0)} capex
            </p>
          </Panel>
        </aside>

        <div className="space-y-4">
          <div
            onClick={place_click}
            className="grid-texture relative h-[52vh] min-h-[380px] cursor-crosshair overflow-hidden rounded-lg border border-border bg-background"
          >
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 55% 55% at 50% 50%, oklch(0.4 0.09 210 / 18%), transparent 70%)",
              }}
            />
            <div className="label-xs pointer-events-none absolute left-4 top-3">
              Site canvas · {place.name} · click to place {DESIGN_COMPONENTS.find((c) => c.id === selected)?.label}
            </div>
            {items.map((it) => {
              const c = DESIGN_COMPONENTS.find((d) => d.id === it.componentId)!;
              return (
                <button
                  key={it.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setItems((prev) => prev.filter((p) => p.id !== it.id));
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 rounded-sm border px-2 py-1 text-[10px] backdrop-blur-sm transition-transform hover:scale-110"
                  style={{
                    left: `${it.x}%`,
                    top: `${it.y}%`,
                    borderColor: SYSTEM_BY_ID[c.system].colorVar,
                    color: SYSTEM_BY_ID[c.system].colorVar,
                    background: "oklch(0.2 0.02 245 / 80%)",
                    boxShadow: `0 0 18px -6px ${SYSTEM_BY_ID[c.system].colorVar}`,
                    fontFamily: "var(--font-mono)",
                    letterSpacing: "0.1em",
                  }}
                  title="Click to remove"
                >
                  {c.label.toUpperCase()}
                </button>
              );
            })}
            {items.length === 0 && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <p className="max-w-sm text-center text-sm text-muted-foreground">
                  The canvas is empty. What would make this place more capable?
                </p>
              </div>
            )}
          </div>

          {totals.warnings.length > 0 && (
            <div className="space-y-2">
              {totals.warnings.map((w, i) => (
                <div
                  key={i}
                  className="animate-rise rounded-sm border p-3 text-sm"
                  style={{
                    borderColor: w.level === "critical" ? "var(--danger)" : "var(--warn)",
                    background: w.level === "critical" ? "oklch(0.68 0.19 25 / 8%)" : "oklch(0.84 0.14 85 / 8%)",
                  }}
                >
                  <div className="label-xs" style={{ color: w.level === "critical" ? "var(--danger)" : "var(--warn)" }}>
                    {w.level === "critical" ? "Constraint breach" : "Design warning"}
                  </div>
                  <p className="mt-1.5 text-foreground">{w.message}</p>
                  <p className="mt-1 text-muted-foreground">Atlas suggests: {w.suggestion}</p>
                </div>
              ))}
            </div>
          )}

          <Panel label="Intervention totals">
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
              <Stat label="Capital" value={fmtUsdM(totals.capexUsdM)} tone="primary" />
              <Stat
                label="Net electricity"
                value={`${totals.netElectricityMw > 0 ? "+" : ""}${totals.netElectricityMw}`}
                unit="MW"
                tone={totals.netElectricityMw > 0 ? "warn" : "good"}
                hint={totals.netElectricityMw > 0 ? "net consumer" : "net generator"}
              />
              <Stat
                label="Net water"
                value={totals.waterM3d.toLocaleString()}
                unit="m³/d"
                tone={totals.waterM3d > 0 ? "warn" : "good"}
              />
              <Stat label="Land" value={totals.landHa.toLocaleString()} unit="ha" />
              <Stat label="Jobs" value={fmtNum(totals.jobs)} tone="good" />
              <Stat
                label="Net CO₂e"
                value={totals.co2Tpa.toLocaleString()}
                unit="t/yr"
                tone={totals.co2Tpa > 0 ? "danger" : "good"}
              />
              <Stat label="Beneficiaries" value={fmtNum(totals.beneficiaries)} />
              <Stat label="Integrity" value={integrity.overall} unit="/100" tone={integrity.overall > 60 ? "good" : "warn"} />
            </div>
            <ProvenanceTag
              method="Estimated"
              confidence="Low"
              source="Atlas component library — per-unit capex, load, water, land and employment intensities derived from published project benchmarks. Site-specific engineering will differ materially."
            />
          </Panel>
        </div>

        <aside className="space-y-3">
          <Panel label="Seven capitals engine">
            <CapitalsRadar values={totals.capitals} />
            <div className="mt-3 space-y-1.5">
              {SEVEN_CAPITALS.map((c) => (
                <div key={c.id} className="flex items-center justify-between text-[12px]">
                  <span className="text-muted-foreground">{c.label}</span>
                  <span className="num">{totals.capitals[c.id]}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
              The objective is not to maximise financial return. It is to maximise long-term
              regenerative value subject to financial, social, ecological and technical constraints.
            </p>
          </Panel>

          <Panel label="Regenerative integrity assessment">
            <div className="space-y-1.5">
              {Object.entries(integrity.scores).map(([k, v]) => (
                <div key={k}>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="num">{v}</span>
                  </div>
                  <div className="mt-1 h-[2px] w-full bg-muted">
                    <div
                      className="h-full"
                      style={{
                        width: `${v}%`,
                        background: v > 65 ? "var(--good)" : v > 45 ? "var(--warn)" : "var(--danger)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2 text-[12px] text-muted-foreground">
              <p>
                <span className="text-foreground">Unknowns. </span>Local hydrology, land tenure,
                community consent, grid protection settings, and maintenance capacity are not modelled.
              </p>
              <p>
                <span className="text-foreground">Questions still open. </span>Who bears the risk if
                demand does not materialise? Who owns the asset in year 25?
              </p>
            </div>
          </Panel>

          <div className="flex gap-2">
            <Link to="/capital" className="flex-1">
              <ActionButton variant="ghost" className="w-full">FINANCE THIS</ActionButton>
            </Link>
            <Link to="/projects" className="flex-1">
              <ActionButton className="w-full">CREATE PROJECT</ActionButton>
            </Link>
          </div>
        </aside>
      </div>
    </Shell>
  );
}
