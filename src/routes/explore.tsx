import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { Shell } from "@/components/atlas/Shell";
import { WorldCanvas } from "@/components/atlas/WorldCanvas";
import { DependencyGraph } from "@/components/atlas/DependencyGraph";
import { ActionButton, Chip, CitationPanel, FactList, Meter, Panel, ProvenanceTag, Stat } from "@/components/atlas/ui";
import {
  ASSETS,
  FACT_BASIS_NOTE,
  OPPORTUNITIES,
  PLACE_FACTS,
  PLACE_BY_ID,
  PLACES,
  SYSTEMS,
  type SystemId,
} from "@/lib/atlas/data";
import { RICI_WEIGHTS, fmtNum, fmtUsdM, rici, riciBand } from "@/lib/atlas/model";
import { downloadReport, infrastructureThesis } from "@/lib/atlas/report";

export const Route = createFileRoute("/explore")({
  validateSearch: z.object({ place: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Explore — Atlas Infrastructure Observatory" },
      {
        name: "description",
        content:
          "Zoom from planetary to site level, activate intelligence layers, inspect dependencies and surface infrastructure opportunities.",
      },
      { property: "og:title", content: "Explore the Atlas Infrastructure Observatory" },
      {
        property: "og:description",
        content: "Places, systems, dependencies and opportunities in one living map.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Explore,
});

const SCOPES = ["Planetary", "Continental", "National", "Regional", "City"] as const;

function Explore() {
  const search = Route.useSearch();
  const [placeId, setPlaceId] = useState(search.place ?? "nairobi");
  const [activeSystems, setActiveSystems] = useState<SystemId[]>(["energy", "compute", "water"]);
  const [activeLayers, setActiveLayers] = useState<string[]>(["grid congestion", "water stress"]);
  const [assetId, setAssetId] = useState<string | null>("asset-dc-nairobi");
  const [showOpps, setShowOpps] = useState(false);

  const place = PLACE_BY_ID[placeId] ?? PLACES[0]!;
  const score = rici(place.indicators);
  const band = riciBand(score);
  const asset = ASSETS.find((a) => a.id === assetId) ?? null;
  const zoom = 1 + SCOPES.indexOf(place.scope) * 0.16;

  const opportunities = useMemo(
    () =>
      OPPORTUNITIES.filter(
        (o) => o.placeId === place.id || PLACE_BY_ID[o.placeId]?.parent === place.id,
      ),
    [place.id],
  );

  const toggle = <T,>(list: T[], v: T) =>
    list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

  return (
    <Shell>
      <div className="grid gap-4 xl:grid-cols-[240px_minmax(0,1fr)_360px]">
        {/* Layer rail */}
        <aside className="space-y-3">
          <Panel label="Systems">
            <div className="flex flex-wrap gap-1.5">
              {SYSTEMS.map((s) => (
                <Chip
                  key={s.id}
                  color={s.colorVar}
                  active={activeSystems.includes(s.id)}
                  onClick={() => setActiveSystems((a) => toggle(a, s.id))}
                >
                  {s.label}
                </Chip>
              ))}
            </div>
          </Panel>
          <Panel label="Intelligence layers">
            <div className="space-y-3">
              {SYSTEMS.filter((s) => activeSystems.includes(s.id)).map((s) => (
                <div key={s.id}>
                  <div className="label-xs" style={{ color: s.colorVar }}>
                    {s.label}
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {s.layers.map((l) => (
                      <Chip
                        key={l}
                        active={activeLayers.includes(l)}
                        onClick={() => setActiveLayers((a) => toggle(a, l))}
                      >
                        {l}
                      </Chip>
                    ))}
                  </div>
                </div>
              ))}
              {activeSystems.length === 0 && (
                <p className="text-xs text-muted-foreground">Select a system to reveal its layers.</p>
              )}
            </div>
          </Panel>
        </aside>

        {/* Map */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="label-xs">Zoom</span>
            {SCOPES.map((s) => (
              <Chip
                key={s}
                active={place.scope === s}
                onClick={() => {
                  const target = PLACES.find((p) => p.scope === s);
                  if (target) setPlaceId(target.id);
                }}
              >
                {s}
              </Chip>
            ))}
          </div>

          <WorldCanvas
            activeSystems={activeSystems}
            selectedPlaceId={place.id}
            onSelectPlace={(p) => setPlaceId(p.id)}
            zoom={zoom}
            className="h-[52vh] min-h-[380px]"
          />

          <Panel
            label="Infrastructure network view"
            right={
              <select
                value={assetId ?? ""}
                onChange={(e) => setAssetId(e.target.value || null)}
                className="label-xs rounded-sm border border-border bg-surface-2 px-2 py-1 outline-none"
              >
                <option value="">Select an asset</option>
                {ASSETS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            }
          >
            {asset ? (
              <>
                <div className="mb-2">
                  <h3 className="font-display text-lg tracking-tight">{asset.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {asset.type} · {asset.scale} · {PLACE_BY_ID[asset.placeId]?.name}
                  </p>
                </div>
                <DependencyGraph asset={asset} />
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No asset is an isolated object. Select one to reveal what it depends on.
              </p>
            )}
          </Panel>
        </div>

        {/* Intelligence panel */}
        <aside className="space-y-3">
          <Panel
            label="Intelligence panel"
            right={<span className="label-xs" style={{ color: band.color }}>{band.label}</span>}
          >
            <h3 className="font-display text-xl tracking-tight">{place.name}</h3>
            <p className="label-xs mt-0.5">
              {place.scope} · {fmtNum(place.population)} people
            </p>
            <p className="mt-3 text-sm text-muted-foreground">{place.headline}</p>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <Stat label="RICI" value={score.toFixed(1)} tone="primary" hint="Composite index, 0–100" cite="rici" />
              <Stat
                label="Constraint"
                value={place.systemStatus.water.risk > place.systemStatus.energy.risk ? "Water" : "Energy"}
                hint={place.constraint}
              />
            </div>

            <div className="mt-4 space-y-2.5">
              {RICI_WEIGHTS.map((w) => (
                <Meter
                  key={w.key}
                  label={`${w.label} · w${w.weight}`}
                  value={place.indicators[w.key]}
                  color={band.color}
                />
              ))}
            </div>
            <ProvenanceTag
              method={place.provenance.method}
              confidence={place.provenance.confidence}
              source={place.provenance.source}
              year={place.provenance.year}
            />
          </Panel>

          <Panel label="Export">
            <p className="text-[12px] text-muted-foreground">
              A traceable document for {place.name}: position, index composition, system status,
              verified statistics, opportunities and full source citations.
            </p>
            <ActionButton
              variant="accent"
              className="mt-3 w-full"
              onClick={() => downloadReport(infrastructureThesis(place, opportunities))}
            >
              EXPORT INFRASTRUCTURE THESIS
            </ActionButton>
          </Panel>

          <Panel label="Verified statistics">
            <FactList facts={PLACE_FACTS[place.id] ?? []} note={FACT_BASIS_NOTE} />
          </Panel>

          <Panel label="System status">
            <div className="space-y-3">
              {SYSTEMS.filter((s) => activeSystems.length === 0 || activeSystems.includes(s.id)).map(
                (s) => {
                  const st = place.systemStatus[s.id];
                  return (
                    <div key={s.id} className="border-b border-border pb-2.5 last:border-0">
                      <div className="flex items-center justify-between">
                        <span className="label-xs" style={{ color: s.colorVar }}>
                          {s.label}
                        </span>
                        <span className="num text-[11px] text-muted-foreground">
                          growth {st.growth > 0 ? "+" : ""}
                          {st.growth}%/yr
                        </span>
                      </div>
                      <div className="mt-1.5 grid grid-cols-3 gap-2">
                        <Meter label="Capacity" value={st.capacity} color={s.colorVar} cite="system.capacity" />
                        <Meter label="Demand" value={st.demand} color="var(--accent)" cite="system.demand" />
                        <Meter label="Risk" value={st.risk} color="var(--danger)" cite="system.risk" />
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </Panel>

          <CitationPanel
            ids={["rici", "place.population", "system.capacity", "system.demand", "system.risk"]}
            title="Data provenance · map metrics"
          />

          <Panel label="Becoming possible">
            <p className="text-sm text-muted-foreground">{place.becomingPossible}</p>
            <ActionButton className="mt-4 w-full" onClick={() => setShowOpps(true)}>
              FIND OPPORTUNITIES
            </ActionButton>
            <Link to="/simulate" search={{ place: place.id }} className="mt-2 block">
              <ActionButton variant="ghost" className="w-full">
                SIMULATE THE FUTURE
              </ActionButton>
            </Link>
            <Link to="/design" search={{ place: place.id }} className="mt-2 block">
              <ActionButton variant="ghost" className="w-full">
                DESIGN THIS FUTURE
              </ActionButton>
            </Link>
          </Panel>
        </aside>
      </div>

      {showOpps && (
        <section className="animate-rise mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="label-xs text-primary">
              Opportunity engine · {opportunities.length} identified for {place.name}
            </h2>
            <button className="label-xs" onClick={() => setShowOpps(false)}>
              COLLAPSE
            </button>
          </div>
          {opportunities.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Atlas has not yet indexed opportunities at this resolution. Zoom to a city or region.
            </p>
          )}
          <div className="grid gap-3 lg:grid-cols-2">
            {opportunities.map((o) => (
              <Panel key={o.id} label={o.code} right={<span className="label-xs">{o.regenerativePotential}</span>}>
                <h3 className="font-display text-lg tracking-tight">{o.title}</h3>
                <p className="label-xs mt-0.5">{PLACE_BY_ID[o.placeId]?.name}</p>
                <p className="mt-3 text-sm text-muted-foreground">
                  <span className="text-foreground">Problem. </span>
                  {o.problem}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  <span className="text-foreground">Opportunity. </span>
                  {o.opportunity}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <Stat label="Capital" value={fmtUsdM(o.capitalUsdM)} tone="primary" cite="capital.capex" />
                  <Stat label="Beneficiaries" value={fmtNum(o.beneficiaries)} />
                  <Stat label="Resilience" value={`+${o.resilienceGainPct}%`} tone="good" />
                  <Stat label="Emissions" value={fmtNum(o.emissionsTco2e)} unit="tCO₂e" tone="good" />
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Q label="Why now?" body={o.whyNow} />
                  <Q label="What could change?" body={o.whatCouldChange} />
                  <Q label="Who needs to participate?" body={o.whoParticipates.join(" · ")} />
                  <Q label="What could prevent it?" body={o.whatCouldPrevent.join(" · ")} />
                </div>
                <div className="mt-4 flex gap-2">
                  <Link to="/design" search={{ place: o.placeId }} className="flex-1">
                    <ActionButton className="w-full" variant="ghost">
                      DESIGN THIS
                    </ActionButton>
                  </Link>
                  <Link to="/capital" className="flex-1">
                    <ActionButton className="w-full" variant="ghost">
                      FINANCE THIS
                    </ActionButton>
                  </Link>
                  <Link to="/projects" className="flex-1">
                    <ActionButton className="w-full">CREATE PROJECT</ActionButton>
                  </Link>
                </div>
                <ProvenanceTag
                  method="Modeled"
                  confidence={o.confidence}
                  source="Atlas opportunity engine — derived from place system status, cost curves and dependency graph traversal"
                />
              </Panel>
            ))}
          </div>
        </section>
      )}
    </Shell>
  );
}

function Q({ label, body }: { label: string; body: string }) {
  return (
    <div className="rounded-sm border border-border p-3">
      <div className="label-xs text-primary">{label}</div>
      <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
