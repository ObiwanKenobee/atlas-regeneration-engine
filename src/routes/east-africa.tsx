import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/atlas/Shell";
import { LivePlantsPanel } from "@/components/atlas/LiveFeeds";
import { ActionButton, BasisChip, Chip, FactList, Meter, Panel, SectionTitle, Stat } from "@/components/atlas/ui";
import {
  EAST_AFRICA_CORRIDORS,
  EA_GRAPH_EDGES,
  EA_GRAPH_NODES,
  FACT_BASIS_NOTE,
  OPPORTUNITIES,
  PLACE_BY_ID,
  PLACE_FACTS,
  SYSTEMS,
  SYSTEM_BY_ID,
} from "@/lib/atlas/data";
import { fmtNum, fmtUsdM, rici, riciBand } from "@/lib/atlas/model";

export const Route = createFileRoute("/east-africa")({
  head: () => ({
    meta: [
      { title: "East Africa Regional Layer | Atlas Sanctum" },
      {
        name: "description",
        content:
          "East Africa's power corridors, regional dependency graph, verified statistics and investable opportunities — walked end to end.",
      },
      { property: "og:title", content: "East Africa — regional infrastructure layer" },
      {
        property: "og:description",
        content: "Interconnectors, hydro, geothermal and the Lake Victoria basin as one regional system.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EastAfrica,
});

const COUNTRIES = [
  { iso2: "KE", name: "Kenya" },
  { iso2: "TZ", name: "Tanzania" },
  { iso2: "UG", name: "Uganda" },
  { iso2: "ET", name: "Ethiopia" },
  { iso2: "RW", name: "Rwanda" },
];

const WALK = [
  { step: "1 · Observe", body: "Verified regional statistics and live plant data establish what exists." },
  { step: "2 · Diagnose", body: "Corridor utilisation shows the binding constraint is the market layer, not the wires." },
  { step: "3 · Map dependencies", body: "The regional graph traces how hydro, geothermal, interconnectors and capital connect." },
  { step: "4 · Choose an opportunity", body: "Three regional opportunities, each with capital, beneficiaries and blockers." },
  { step: "5 · Simulate, design, finance", body: "Each opportunity opens directly in the Simulate, Design and Capital screens." },
];

function EastAfrica() {
  const place = PLACE_BY_ID["east-africa"]!;
  const score = rici(place.indicators);
  const band = riciBand(score);
  const opps = OPPORTUNITIES.filter((o) => o.placeId === "east-africa");
  const [oppId, setOppId] = useState(opps[0]!.id);
  const opp = opps.find((o) => o.id === oppId)!;
  const [country, setCountry] = useState(COUNTRIES[0]!);
  const [hover, setHover] = useState<string | null>(null);

  return (
    <Shell>
      <SectionTitle
        kicker="Regional layer"
        title="East Africa"
        sub="Kenya, Ethiopia, Tanzania, Uganda and Rwanda read as one infrastructure system: shared rivers, shared wires, shared capital constraints."
      />

      <Panel label="End-to-end walk" className="mb-4">
        <ol className="grid gap-2 md:grid-cols-5">
          {WALK.map((w) => (
            <li key={w.step} className="rounded-sm border border-border p-3">
              <div className="label-xs text-primary">{w.step}</div>
              <p className="mt-1 text-[12px] leading-snug text-muted-foreground">{w.body}</p>
            </li>
          ))}
        </ol>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
          <Panel label="1 · Regional position">
            <h3 className="font-display text-xl tracking-tight">{place.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{place.headline}</p>
            <div className="mt-4 grid grid-cols-2 gap-5 sm:grid-cols-4">
              <Stat label="RICI" value={score.toFixed(1)} tone="primary" cite="rici" />
              <Stat label="Population" value={fmtNum(place.population)} cite="place.population" />
              <Stat label="GDP / capita" value={`$${place.gdpPerCapita.toLocaleString()}`} cite="place.gdpPerCapita" />
              <Stat label="Band" value={band.label} />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {SYSTEMS.map((s) => {
                const st = place.systemStatus[s.id];
                return (
                  <Meter
                    key={s.id}
                    label={`${s.label} · capacity vs demand ${st.demand}`}
                    value={st.capacity}
                    color={s.colorVar}
                    cite="system.capacity"
                  />
                );
              })}
            </div>
          </Panel>

          <Panel label="2 · Corridors · where the constraint actually sits">
            <div className="space-y-3">
              {EAST_AFRICA_CORRIDORS.map((c) => (
                <div key={c.id} className="rounded-sm border border-border p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="text-[13px]">{c.label}</div>
                      <div className="label-xs mt-0.5" style={{ color: SYSTEM_BY_ID[c.system].colorVar }}>
                        {c.from} → {c.to} · {c.capacity} · {c.status}
                      </div>
                    </div>
                    <BasisChip basis={c.basis} />
                  </div>
                  {c.utilisation > 0 && (
                    <div className="mt-2">
                      <Meter label="Utilisation of rated capacity" value={c.utilisation} suffix="%" color={SYSTEM_BY_ID[c.system].colorVar} />
                    </div>
                  )}
                  <p className="mt-2 text-[12px] text-muted-foreground">{c.note}</p>
                  <div className="label-xs mt-1 text-[9px]">{c.source} · {c.year}</div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel label="3 · Regional dependency graph">
            <svg viewBox="0 0 100 100" className="h-[440px] w-full">
              {EA_GRAPH_EDGES.map((e) => {
                const a = EA_GRAPH_NODES.find((n) => n.id === e.from)!;
                const b = EA_GRAPH_NODES.find((n) => n.id === e.to)!;
                const lit = hover === a.id || hover === b.id;
                return (
                  <g key={`${e.from}-${e.to}`}>
                    <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={lit ? "var(--accent)" : "var(--primary)"} strokeOpacity={lit ? 0.9 : 0.35} strokeWidth={lit ? 0.45 : 0.25} strokeDasharray="1 1.6" style={{ animation: "atlas-dash 14s linear infinite" }} />
                    <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 0.7} fontSize="1.5" textAnchor="middle" fill="var(--muted-foreground)" style={{ fontFamily: "var(--font-mono)" }}>
                      {e.rel}
                    </text>
                  </g>
                );
              })}
              {EA_GRAPH_NODES.map((n) => (
                <g key={n.id} onMouseEnter={() => setHover(n.id)} onMouseLeave={() => setHover(null)} className="cursor-pointer">
                  <circle cx={n.x} cy={n.y} r={hover === n.id ? 2.1 : 1.5} fill={n.kind === "Problem" ? "var(--warn)" : n.kind === "Capital" ? "var(--accent)" : "var(--primary)"} />
                  <text x={n.x} y={n.y - 2.6} fontSize="2" textAnchor="middle" fill="var(--foreground)" style={{ fontFamily: "var(--font-mono)" }}>{n.label}</text>
                  <text x={n.x} y={n.y + 4} fontSize="1.5" textAnchor="middle" fill="var(--muted-foreground)" style={{ fontFamily: "var(--font-mono)" }}>{n.kind.toUpperCase()}</text>
                </g>
              ))}
            </svg>
            <p className="text-[11px] text-muted-foreground">Hover a node to light its dependencies. Amber = problem, teal = asset or system, gold = capital.</p>
          </Panel>

          <Panel label="4 · Regional opportunities">
            <div className="mb-3 flex flex-wrap gap-1.5">
              {opps.map((o) => (
                <Chip key={o.id} active={o.id === oppId} onClick={() => setOppId(o.id)}>{o.title}</Chip>
              ))}
            </div>
            <div className="label-xs text-primary">{opp.code} · confidence {opp.confidence}</div>
            <h3 className="mt-1 font-display text-lg tracking-tight">{opp.title}</h3>
            <p className="mt-2 text-[13px] text-muted-foreground"><span className="text-foreground">Problem — </span>{opp.problem}</p>
            <p className="mt-2 text-[13px] text-muted-foreground"><span className="text-foreground">Opportunity — </span>{opp.opportunity}</p>
            <div className="mt-4 grid grid-cols-2 gap-5 sm:grid-cols-4">
              <Stat label="Capital" value={fmtUsdM(opp.capitalUsdM)} tone="primary" />
              <Stat label="Beneficiaries" value={fmtNum(opp.beneficiaries)} />
              <Stat label="Resilience" value={`+${opp.resilienceGainPct}%`} tone="good" />
              <Stat label="CO₂e avoided" value={fmtNum(opp.emissionsTco2e)} unit="t" />
            </div>
            <p className="mt-3 text-[12px] text-muted-foreground"><span className="text-foreground">Why now — </span>{opp.whyNow}</p>
            <p className="mt-1 text-[12px] text-muted-foreground"><span className="text-foreground">Who — </span>{opp.whoParticipates.join(" · ")}</p>
            <p className="mt-1 text-[12px] text-muted-foreground"><span className="text-foreground">What could stop it — </span>{opp.whatCouldPrevent.join(" · ")}</p>
            <p className="label-xs mt-3 text-[9px]">Opportunity figures are Atlas estimates (Modeled) — they are hypotheses to test, not measurements.</p>

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <Link to="/simulate" search={{ place: "east-africa" }}><ActionButton className="w-full">5 · SIMULATE</ActionButton></Link>
              <Link to="/design" search={{ place: "east-africa" }}><ActionButton variant="ghost" className="w-full">DESIGN</ActionButton></Link>
              <Link to="/capital" search={{ opp: opp.id }}><ActionButton variant="accent" className="w-full">FINANCE</ActionButton></Link>
            </div>
          </Panel>
        </div>

        <aside className="space-y-4">
          <Panel label="Verified regional statistics">
            <FactList facts={PLACE_FACTS["east-africa"] ?? []} note={FACT_BASIS_NOTE} />
          </Panel>
          <div className="flex flex-wrap gap-1.5">
            {COUNTRIES.map((c) => (
              <Chip key={c.iso2} active={c.iso2 === country.iso2} onClick={() => setCountry(c)}>{c.name}</Chip>
            ))}
          </div>
          <LivePlantsPanel iso2={country.iso2} countryName={country.name} />
        </aside>
      </div>
    </Shell>
  );
}
