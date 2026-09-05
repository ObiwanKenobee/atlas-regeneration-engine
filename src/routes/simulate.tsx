import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/atlas/Shell";
import {
  ActionButton,
  Chip,
  CitationPanel,
  Meter,
  Panel,
  ProvenanceTag,
  SectionTitle,
  Slider,
  Stat,
} from "@/components/atlas/ui";
import { PLACES, PLACE_BY_ID } from "@/lib/atlas/data";
import { downloadReport, futureScenario } from "@/lib/atlas/report";
import {
  DEFAULT_VARS,
  SCENARIO_METRICS,
  SCENARIO_PRESETS,
  VAR_META,
  compareScenarios,
  simulate,
  type ComparedScenario,
  type ScenarioVars,
} from "@/lib/atlas/model";


export const Route = createFileRoute("/simulate")({
  validateSearch: z.object({ place: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Simulate — Alternative Infrastructure Futures | Atlas Sanctum" },
      {
        name: "description",
        content:
          "Move the variables that shape infrastructure — compute demand, energy, water, capital, restoration — and watch the system respond.",
      },
      { property: "og:title", content: "Simulate alternative infrastructure futures" },
      {
        property: "og:description",
        content: "Business as usual, regenerative transition, AI supercompute, climate stress — modelled transparently.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Simulate,
});

type Saved = { name: string; placeId: string; vars: ScenarioVars };

function Simulate() {
  const search = Route.useSearch();
  const [placeId, setPlaceId] = useState(search.place ?? "nairobi");
  const [vars, setVars] = useState<ScenarioVars>(DEFAULT_VARS);
  const [preset, setPreset] = useState<string | null>(null);
  const [saved, setSaved] = useState<Saved[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("atlas.futures");
      if (raw) setSaved(JSON.parse(raw) as Saved[]);
    } catch {
      /* ignore */
    }
  }, []);

  const place = PLACE_BY_ID[placeId] ?? PLACES[0]!;
  const out = simulate(place, vars);
  const baseline = simulate(place, DEFAULT_VARS);

  const saveFuture = () => {
    const name = `MY FUTURE ${saved.length + 1}`;
    const next = [...saved, { name, placeId, vars }];
    setSaved(next);
    try {
      localStorage.setItem("atlas.futures", JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const delta = (a: number, b: number) => {
    const d = a - b;
    return `${d > 0 ? "+" : ""}${d.toFixed(1)}`;
  };

  // ---- comparison mode ----------------------------------------------------
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>(["current", "bau", "regenerative"]);

  const candidates = useMemo(() => {
    const list: Array<{ id: string; label: string; placeId: string; vars: ScenarioVars }> = [
      { id: "current", label: "Current settings", placeId, vars },
      ...SCENARIO_PRESETS.map((p) => ({ id: p.id, label: p.label, placeId, vars: p.vars })),
      ...saved.map((s, i) => ({ id: `saved-${i}`, label: s.name, placeId: s.placeId, vars: s.vars })),
    ];
    return list;
  }, [placeId, vars, saved]);

  const comparedScenarios: ComparedScenario[] = useMemo(
    () =>
      compareIds
        .map((id) => candidates.find((c) => c.id === id))
        .filter((c): c is NonNullable<typeof c> => Boolean(c))
        .map((c) => ({
          id: c.id,
          label: c.label,
          placeId: c.placeId,
          vars: c.vars,
          out: simulate(PLACE_BY_ID[c.placeId] ?? place, c.vars),
        })),
    [compareIds, candidates, place],
  );

  const comparison = useMemo(() => compareScenarios(comparedScenarios), [comparedScenarios]);

  const toggleCompare = (id: string) =>
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= 4 ? prev : [...prev, id],
    );

  const exportScenario = () =>
    downloadReport(
      futureScenario(place, vars, out, baseline, SCENARIO_PRESETS.find((p) => p.id === preset)?.label),
    );

  return (
    <Shell>
      <SectionTitle
        kicker="Simulate"
        title="Simulate the future"
        sub="Change the variables. Every output below is a stated function of the inputs — no hidden magic, no decorative numbers."
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <ActionButton variant={compareMode ? "primary" : "ghost"} onClick={() => setCompareMode((c) => !c)}>
          {compareMode ? "EXIT COMPARISON MODE" : "COMPARE SCENARIOS"}
        </ActionButton>
        <ActionButton variant="accent" onClick={exportScenario}>
          EXPORT FUTURE SCENARIO
        </ActionButton>
      </div>

      {compareMode && (
        <div className="mb-4 space-y-4">
          <Panel label="Futures in comparison · pick up to four">
            <div className="flex flex-wrap gap-1.5">
              {candidates.map((c) => (
                <Chip key={c.id} active={compareIds.includes(c.id)} onClick={() => toggleCompare(c.id)}>
                  {c.label}
                </Chip>
              ))}
            </div>
          </Panel>

          {comparedScenarios.length >= 2 ? (
            <>
              <Panel label="Side-by-side system response">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[620px] border-collapse text-[13px]">
                    <thead>
                      <tr>
                        <th className="label-xs border-b border-border py-2 text-left">Metric</th>
                        {comparedScenarios.map((s) => (
                          <th key={s.id} className="label-xs border-b border-border py-2 text-right">
                            {s.label}
                          </th>
                        ))}
                        <th className="label-xs border-b border-border py-2 text-right">Spread</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparison.rows.map((r) => (
                        <tr key={r.meta.key}>
                          <td className="border-b border-border py-2 pr-3">
                            <span className="flex items-center gap-1.5">
                              <span className="text-muted-foreground">{r.meta.label}</span>
                              <span className="label-xs text-[9px] text-muted-foreground">{r.meta.unit}</span>
                            </span>
                          </td>
                          {r.values.map((v, i) => (
                            <td
                              key={i}
                              className="num border-b border-border py-2 text-right"
                              style={{
                                color:
                                  i === r.bestIndex
                                    ? "var(--good)"
                                    : i === r.worstIndex
                                      ? "var(--warn)"
                                      : "var(--foreground)",
                              }}
                            >
                              {v}
                            </td>
                          ))}
                          <td className="num border-b border-border py-2 text-right text-muted-foreground">
                            {r.spreadPct}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-3 text-[11px] text-muted-foreground">
                  Green marks the favourable end of each row, amber the unfavourable one. Direction of
                  benefit is declared per metric: {SCENARIO_METRICS.filter((m) => m.better === "lower").length}{" "}
                  metrics are better lower, the rest better higher.
                </p>
                <ProvenanceTag
                  method="Modeled"
                  confidence="Low"
                  source="Atlas scenario model v0.4 — the same deterministic equations applied to each variable set. Differences between columns are model differences, not observations."
                  year={2025}
                />
              </Panel>

              <div className="grid gap-4 lg:grid-cols-2">
                <Panel label="Biggest trade-offs">
                  <ul className="space-y-3">
                    {comparison.tradeoffs.map((t) => (
                      <li key={t.label} className="border-b border-border pb-2.5 last:border-0">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[13px] text-foreground">{t.label}</span>
                          <span className="num text-xs text-primary">{t.spreadPct}% spread</span>
                        </div>
                        <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{t.reading}</p>
                      </li>
                    ))}
                  </ul>
                </Panel>

                <Panel label="Expected impact per future">
                  <div className="space-y-3">
                    {comparison.impacts.map((im) => (
                      <div key={im.id} className="border-b border-border pb-2.5 last:border-0">
                        <div className="label-xs text-foreground">{im.label}</div>
                        <ul className="mt-1 space-y-0.5 text-[12px]">
                          {im.gains.map((g) => (
                            <li key={g} className="text-good">
                              + {g}
                            </li>
                          ))}
                          {im.costs.map((c) => (
                            <li key={c} className="text-warn">
                              − {c}
                            </li>
                          ))}
                          {im.gains.length === 0 && im.costs.length === 0 && (
                            <li className="text-muted-foreground">
                              Materially indistinguishable from the other futures selected.
                            </li>
                          )}
                        </ul>
                      </div>
                    ))}
                  </div>
                </Panel>
              </div>
            </>
          ) : (
            <Panel label="Side-by-side system response">
              <p className="text-sm text-muted-foreground">
                Select at least two futures to compare.
              </p>
            </Panel>
          )}
        </div>
      )}


      <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className="space-y-3">
          <Panel label="Place">
            <div className="flex flex-wrap gap-1.5">
              {PLACES.map((p) => (
                <Chip key={p.id} active={p.id === placeId} onClick={() => setPlaceId(p.id)}>
                  {p.name}
                </Chip>
              ))}
            </div>
          </Panel>

          <Panel label="Scenario presets">
            <div className="flex flex-wrap gap-1.5">
              {SCENARIO_PRESETS.map((p) => (
                <Chip
                  key={p.id}
                  active={preset === p.id}
                  onClick={() => {
                    setPreset(p.id);
                    setVars(p.vars);
                  }}
                >
                  {p.label}
                </Chip>
              ))}
            </div>
            {preset && (
              <p className="mt-3 text-[13px] text-muted-foreground">
                {SCENARIO_PRESETS.find((p) => p.id === preset)?.note}
              </p>
            )}
            <div className="mt-4 flex gap-2">
              <ActionButton variant="ghost" className="flex-1" onClick={() => { setVars(DEFAULT_VARS); setPreset(null); }}>
                RESET
              </ActionButton>
              <ActionButton className="flex-1" onClick={saveFuture}>
                SAVE MY FUTURE
              </ActionButton>
            </div>
            {saved.length > 0 && (
              <ul className="mt-3 space-y-1">
                {saved.map((s, i) => (
                  <li key={i}>
                    <button
                      onClick={() => { setVars(s.vars); setPlaceId(s.placeId); setPreset(null); }}
                      className="label-xs w-full rounded-sm border border-border px-2 py-1.5 text-left hover:border-primary/50"
                    >
                      {s.name} · {PLACE_BY_ID[s.placeId]?.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel label="Variables">
            <div className="space-y-4">
              {VAR_META.map((m) => (
                <Slider
                  key={m.key}
                  label={m.label}
                  min={m.min}
                  max={m.max}
                  suffix={m.suffix}
                  value={vars[m.key]}
                  onChange={(v) => {
                    setVars((prev) => ({ ...prev, [m.key]: v }));
                    setPreset(null);
                  }}
                />
              ))}
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel label={`System response · ${place.name}`}>
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              <Stat label="Energy demand" value={out.energyDemandTwh} unit="TWh/yr" hint={`vs baseline ${delta(out.energyDemandTwh, baseline.energyDemandTwh)}`} tone="primary" />
              <Stat label="Compute load" value={out.computeLoadMw} unit="MW" hint={`vs baseline ${delta(out.computeLoadMw, baseline.computeLoadMw)}`} />
              <Stat label="Water demand" value={out.waterDemandMm3} unit="Mm³/yr" hint={`vs baseline ${delta(out.waterDemandMm3, baseline.waterDemandMm3)}`} />
              <Stat label="Emissions" value={out.emissionsMtco2e} unit="MtCO₂e" tone={out.emissionsMtco2e > baseline.emissionsMtco2e ? "danger" : "good"} />
              <Stat label="Infrastructure gap" value={`$${out.infrastructureGapUsdB}B`} tone="warn" />
              <Stat label="Capital requirement" value={`$${out.capitalRequirementUsdB}B`} />
              <Stat label="People with access" value={out.peopleWithAccessM} unit="M" tone="good" />
              <Stat label="Economic activity" value={out.economicActivityIndex} unit="index" />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <Meter label="Resilience" value={out.resilience} color="var(--good)" />
              <Meter label="Ecosystem health" value={out.ecosystemHealth} color="var(--signal-ecology)" />
              <Meter label="RICI" value={out.ricIndex} color="var(--primary)" />
            </div>

            <ProvenanceTag
              method="Modeled"
              confidence="Low"
              source="Atlas scenario model v0.4 — deterministic system of equations over population, income, system capacity/demand and scenario variables. Sensitive to assumptions; use for direction, not magnitude."
              year={2025}
            />
          </Panel>

          <div className="grid gap-4 lg:grid-cols-2">
            <Panel label="What this future requires">
              <ul className="space-y-2 text-[13px] text-muted-foreground">
                <li>
                  <span className="text-foreground">Generation. </span>
                  ~{Math.round(out.energyDemandTwh * 0.19)} GW of new firm-equivalent capacity at{" "}
                  {vars.renewablePenetration}% renewable share.
                </li>
                <li>
                  <span className="text-foreground">Water. </span>
                  {Math.round(out.waterDemandMm3 * 0.11)} Mm³/yr of new supply or reuse to avoid
                  competing with agriculture.
                </li>
                <li>
                  <span className="text-foreground">Capital. </span>${out.capitalRequirementUsdB}B over
                  the horizon — roughly ${(out.capitalRequirementUsdB / 15).toFixed(1)}B per year.
                </li>
                <li>
                  <span className="text-foreground">People. </span>
                  {Math.round(out.capitalRequirementUsdB * 4200).toLocaleString()} skilled roles across
                  construction, operations and maintenance.
                </li>
              </ul>
              <Link to="/design" search={{ place: placeId }}>
                <ActionButton className="mt-4 w-full">DESIGN THIS FUTURE</ActionButton>
              </Link>
            </Panel>

            <Panel label="Trade-offs Atlas will not hide">
              <ul className="space-y-2 text-[13px] text-muted-foreground">
                {out.ecosystemHealth < 50 && (
                  <li className="text-warn">Ecosystem health falls below 50 — the future is being paid for with natural capital.</li>
                )}
                {out.emissionsMtco2e > baseline.emissionsMtco2e && (
                  <li className="text-warn">Emissions rise against baseline despite renewable growth: demand is outrunning the transition.</li>
                )}
                {vars.investment < 40 && (
                  <li>Investment below 40% growth leaves the reliability gap unaddressed regardless of new generation.</li>
                )}
                {vars.waterAvailability < -20 && (
                  <li className="text-danger">Water availability at {vars.waterAvailability}% makes evaporative cooling and irrigation directly competitive.</li>
                )}
                <li>
                  Unknown: local grid topology, land tenure, and the political economy of tariffs are
                  not represented in this model.
                </li>
              </ul>
            </Panel>
          </div>
        </div>
      </div>
    </Shell>
  );
}
