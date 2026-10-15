import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/atlas/Shell";
import { WorldCanvas } from "@/components/atlas/WorldCanvas";
import { LiveIndicatorsPanel } from "@/components/atlas/LiveFeeds";
import { CitationPanel, FactList, Meter, Panel, ProvenanceTag, SectionTitle, Stat } from "@/components/atlas/ui";
import {
  FACT_BASIS_NOTE,
  GRAPH_EDGES,
  GRAPH_NODES,
  PLACES,
  PLACE_FACTS,
  RADAR_FRONTIERS,
  SYSTEMS,
} from "@/lib/atlas/data";
import { RICI_WEIGHTS, rici, riciBand } from "@/lib/atlas/model";

export const Route = createFileRoute("/observe")({
  head: () => ({
    meta: [
      { title: "Observe — Global Infrastructure Radar | Atlas Sanctum" },
      {
        name: "description",
        content:
          "A continuously updating view of infrastructure investment, energy and compute demand, water stress and emerging infrastructure frontiers.",
      },
      { property: "og:title", content: "Global Infrastructure Radar" },
      {
        property: "og:description",
        content: "What exists, what is changing, what is constrained, what is becoming possible.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Observe,
});

function Observe() {
  const world = PLACES[0]!;
  const ranked = [...PLACES]
    .filter((p) => p.id !== "world")
    .sort((a, b) => rici(b.indicators) - rici(a.indicators));

  return (
    <Shell>
      <SectionTitle
        kicker="Observe"
        title="Global infrastructure intelligence"
        sub="Four questions, continuously answered: what exists, what is changing, what is constrained, what is becoming possible."
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <WorldCanvas activeSystems={SYSTEMS.map((s) => s.id)} className="h-[46vh] min-h-[340px]" />

        <Panel label="Emerging infrastructure frontiers">
          <div className="space-y-3">
            {RADAR_FRONTIERS.map((f) => (
              <div key={f.label} className="flex items-center justify-between gap-3 border-b border-border pb-2.5 last:border-0">
                <div className="min-w-0">
                  <div className="truncate text-[13px]">{f.label}</div>
                  <div className="label-xs">{f.state}</div>
                </div>
                <div
                  className="num text-sm"
                  style={{ color: f.delta >= 0 ? "var(--accent)" : "var(--primary)" }}
                >
                  {f.delta > 0 ? "+" : ""}
                  {f.delta}
                  <span className="ml-1 text-[10px] text-muted-foreground">{f.unit}</span>
                </div>
              </div>
            ))}
          </div>
          <ProvenanceTag
            method="Estimated"
            confidence="Medium"
            source="Atlas radar composite — IEA, EIA, ENTSO-E, WRI Aqueduct, GIH pipeline, public filings"
            year={2025}
          />
        </Panel>
      </div>

      <div className="mt-4">
        <LiveIndicatorsPanel />
      </div>

      <Panel className="mt-4" label="Country statistics · Kenya, Nigeria, South Africa, Brazil">
        <div className="grid gap-x-8 md:grid-cols-2 xl:grid-cols-4">
          {(["kenya", "nigeria", "south-africa", "brazil"] as const).map((id) => (
            <div key={id}>
              <div className="label-xs mb-2 text-primary">{PLACES.find((p) => p.id === id)?.name}</div>
              <FactList facts={PLACE_FACTS[id] ?? []} />
            </div>
          ))}
        </div>
        <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">{FACT_BASIS_NOTE}</p>
      </Panel>

      <Panel className="mt-4" label="Planetary statistics · what is actually measured">
        <div className="grid gap-x-8 gap-y-0 md:grid-cols-2 xl:grid-cols-3">
          <FactList facts={PLACE_FACTS["world"] ?? []} />
        </div>
        <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">{FACT_BASIS_NOTE}</p>
      </Panel>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel label="Planetary system status">
          <div className="space-y-3">
            {SYSTEMS.map((s) => {
              const st = world.systemStatus[s.id];
              return (
                <div key={s.id}>
                  <div className="flex items-center justify-between">
                    <span className="label-xs" style={{ color: s.colorVar }}>
                      {s.label}
                    </span>
                    <span className="num text-[11px] text-muted-foreground">
                      cap {st.capacity} · dem {st.demand} · risk {st.risk}
                    </span>
                  </div>
                  <div className="mt-1 h-[3px] w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full"
                      style={{
                        width: `${st.capacity}%`,
                        background: s.colorVar,
                        boxShadow: `0 0 10px ${s.colorVar}`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel label="Atlas Infrastructure Score · RICI">
          <Stat label="Global composite" value={rici(world.indicators).toFixed(1)} tone="primary" cite="rici" />
          <p className="mt-2 text-[13px] text-muted-foreground">
            Weighted mean of ten indicators. The methodology is never hidden — drill from global to
            country, region, city, system, asset, indicator.
          </p>
          <div className="mt-3 space-y-2">
            {RICI_WEIGHTS.map((w) => (
              <Meter key={w.key} label={`${w.label} · weight ${w.weight}`} value={world.indicators[w.key]} cite="rici" />
            ))}
          </div>
        </Panel>

        <Panel label="Drill-down · ranked places">
          <ul className="space-y-1.5">
            {ranked.map((p) => {
              const s = rici(p.indicators);
              const band = riciBand(s);
              return (
                <li key={p.id}>
                  <Link
                    to="/explore"
                    search={{ place: p.id }}
                    className="flex items-center justify-between rounded-sm border border-transparent px-2 py-1.5 text-[13px] hover:border-primary/40 hover:bg-surface-2"
                  >
                    <span className="truncate">{p.name}</span>
                    <span className="num text-xs" style={{ color: band.color }}>
                      {s.toFixed(1)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      <div className="mt-4">
        <CitationPanel
          ids={["rici", "system.capacity", "system.demand", "system.risk", "radar.frontier", "place.population"]}
          title="Data provenance · dashboard metrics"
        />
      </div>

      <Panel className="mt-4" label="Infrastructure opportunity graph">
        <p className="mb-3 max-w-3xl text-sm text-muted-foreground">
          The connective tissue: problems, places, assets, technologies, organisations, communities,
          capital, projects, outcomes and ecosystems as one traversable graph.
        </p>
        <svg viewBox="0 0 100 100" className="h-[420px] w-full">
          {GRAPH_EDGES.map((e) => {
            const a = GRAPH_NODES.find((n) => n.id === e.from);
            const b = GRAPH_NODES.find((n) => n.id === e.to);
            if (!a || !b) return null;
            return (
              <g key={`${e.from}-${e.to}`}>
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke="var(--primary)"
                  strokeOpacity="0.35"
                  strokeWidth="0.25"
                  strokeDasharray="1 1.6"
                  style={{ animation: "atlas-dash 14s linear infinite" }}
                />
                <text
                  x={(a.x + b.x) / 2}
                  y={(a.y + b.y) / 2 - 0.7}
                  fontSize="1.5"
                  textAnchor="middle"
                  fill="var(--muted-foreground)"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {e.rel}
                </text>
              </g>
            );
          })}
          {GRAPH_NODES.map((n) => (
            <g key={n.id}>
              <circle cx={n.x} cy={n.y} r="1.5" fill="var(--primary)" />
              <text
                x={n.x}
                y={n.y - 2.6}
                fontSize="2"
                textAnchor="middle"
                fill="var(--foreground)"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {n.label}
              </text>
              <text
                x={n.x}
                y={n.y + 4}
                fontSize="1.5"
                textAnchor="middle"
                fill="var(--muted-foreground)"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {n.kind.toUpperCase()}
              </text>
            </g>
          ))}
        </svg>
      </Panel>
    </Shell>
  );
}
