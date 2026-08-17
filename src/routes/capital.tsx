import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/atlas/Shell";
import { ActionButton, Chip, Meter, Panel, ProvenanceTag, SectionTitle, Slider, Stat } from "@/components/atlas/ui";
import { CAPITAL_SOURCES, OPPORTUNITIES, PLACE_BY_ID } from "@/lib/atlas/data";
import { DEFAULT_STACK, fmtUsdM, stackAnalysis, type CapitalStack } from "@/lib/atlas/model";

export const Route = createFileRoute("/capital")({
  head: () => ({
    meta: [
      { title: "Capital — Financing Regenerative Infrastructure | Atlas Sanctum" },
      {
        name: "description",
        content:
          "Map capital requirements against funding sources, build a capital stack and see feasibility change as the blend changes.",
      },
      { property: "og:title", content: "Finance this future" },
      {
        property: "og:description",
        content: "Government, DFI, private, climate, community and philanthropic capital, blended transparently.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Capital,
});

function Capital() {
  const [oppId, setOppId] = useState(OPPORTUNITIES[0]!.id);
  const [stack, setStack] = useState<CapitalStack>(DEFAULT_STACK);

  const opp = OPPORTUNITIES.find((o) => o.id === oppId)!;
  const analysis = stackAnalysis(stack, opp.capitalUsdM);

  return (
    <Shell>
      <SectionTitle
        kicker="Capital"
        title="Finance this future"
        sub="Capital is infrastructure too. Change the blend and watch feasibility, cost and patience move."
      />

      <div className="mb-4 flex flex-wrap gap-1.5">
        {OPPORTUNITIES.map((o) => (
          <Chip key={o.id} active={o.id === oppId} onClick={() => setOppId(o.id)}>
            {o.title}
          </Chip>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="space-y-4">
          <Panel label="Capital requirement">
            <h3 className="font-display text-xl tracking-tight">{opp.title}</h3>
            <p className="label-xs mt-0.5">{PLACE_BY_ID[opp.placeId]?.name}</p>
            <div className="mt-4 grid grid-cols-2 gap-5 sm:grid-cols-4">
              <Stat label="Total capex" value={fmtUsdM(opp.capitalUsdM)} tone="primary" />
              <Stat label="Blended cost" value={`${analysis.blendedCost}%`} tone={analysis.blendedCost < 8 ? "good" : "warn"} />
              <Stat label="Annual service" value={fmtUsdM(analysis.annualDebtServiceUsdM)} />
              <Stat label="Feasibility" value={analysis.feasibility} unit="/100" tone={analysis.feasibility > 60 ? "good" : "warn"} />
            </div>

            <div className="mt-6 h-8 w-full overflow-hidden rounded-sm border border-border">
              <div className="flex h-full w-full">
                {CAPITAL_SOURCES.filter((s) => (stack[s.id] ?? 0) > 0).map((s, i) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-center text-[9px]"
                    style={{
                      width: `${((stack[s.id] ?? 0) / Math.max(1, analysis.total)) * 100}%`,
                      background: `oklch(${0.5 + i * 0.05} 0.11 ${180 + i * 24})`,
                      color: "var(--background)",
                      fontFamily: "var(--font-mono)",
                      letterSpacing: "0.1em",
                    }}
                    title={`${s.label} ${stack[s.id]}%`}
                  >
                    {stack[s.id]}%
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {CAPITAL_SOURCES.filter((s) => (stack[s.id] ?? 0) > 0).map((s) => (
                <span key={s.id} className="label-xs">
                  {s.label} {stack[s.id]}%
                </span>
              ))}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <Meter label="Patience" value={analysis.patience} color="var(--primary)" />
              <Meter label="Risk appetite" value={analysis.riskAppetite} color="var(--accent)" />
              <Meter label="Feasibility" value={analysis.feasibility} color="var(--good)" />
            </div>

            {analysis.total !== 100 && (
              <p className="mt-4 rounded-sm border border-warn/50 bg-warn/8 p-3 text-sm text-warn">
                The stack totals {analysis.total}%. A stack that does not close is not a financing
                plan — it is a wish.
              </p>
            )}

            <ProvenanceTag
              method="Modeled"
              confidence="Medium"
              source="Atlas capital model — weighted cost, patience and risk appetite per source class. Indicative only; not investment advice."
            />
          </Panel>

          <Panel label="Financing architecture">
            <div className="grid gap-3 sm:grid-cols-2">
              {CAPITAL_SOURCES.map((s) => (
                <div key={s.id} className="rounded-sm border border-border p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px]">{s.label}</span>
                    <span className="num text-[11px] text-primary">{s.costOfCapital}%</span>
                  </div>
                  <p className="mt-1 text-[12px] text-muted-foreground">{s.note}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <aside className="space-y-3">
          <Panel label="Capital stack">
            <div className="space-y-4">
              {CAPITAL_SOURCES.map((s) => (
                <Slider
                  key={s.id}
                  label={s.label}
                  min={0}
                  max={100}
                  suffix="%"
                  value={stack[s.id] ?? 0}
                  onChange={(v) => setStack((prev) => ({ ...prev, [s.id]: v }))}
                />
              ))}
            </div>
            <ActionButton variant="ghost" className="mt-4 w-full" onClick={() => setStack(DEFAULT_STACK)}>
              RESET TO DEFAULT STACK
            </ActionButton>
          </Panel>

          <Panel label="Where capital is moving">
            <ul className="space-y-2 text-[13px] text-muted-foreground">
              <li>Compute and grid capex are absorbing capital that previously went to transport.</li>
              <li>Climate adaptation finance remains under-subscribed relative to stated pipelines.</li>
              <li>Emerging-market cost of capital, not project quality, is the binding constraint.</li>
              <li>Outcome-based instruments grow where measurement infrastructure already exists.</li>
            </ul>
            <Link to="/projects">
              <ActionButton className="mt-4 w-full">TAKE THIS TO A PROJECT</ActionButton>
            </Link>
          </Panel>
        </aside>
      </div>
    </Shell>
  );
}
