// Atlas Sanctum — exportable reports.
// Four documents, each traceable: every figure carries its basis, confidence
// and named sources, drawn from the metric provenance registry.

import {
  CAPITAL_SOURCES,
  FACT_BASIS_NOTE,
  PLACE_FACTS,
  SEVEN_CAPITALS,
  type CapitalId,
  type Opportunity,
  type Place,
} from "./data";
import {
  RICI_WEIGHTS,
  VAR_META,
  fmtUsdM,
  rici,
  riciBand,
  type CapitalStack,
  type DesignItem,
  type DesignTotals,
  type ScenarioOutput,
  type ScenarioVars,
} from "./model";
import { BASIS_NOTE, METRIC_PROVENANCE, citationLine } from "./provenance";

export type ReportKind = "thesis" | "scenario" | "blueprint" | "capital";

export type Report = { title: string; filename: string; markdown: string };

const stamp = () => new Date().toISOString().slice(0, 16).replace("T", " ") + " UTC";

function header(title: string, subtitle: string) {
  return [
    `# ${title}`,
    "",
    `_${subtitle}_`,
    "",
    `Generated ${stamp()} · Atlas Sanctum — Regenerative Infrastructure Intelligence Observatory`,
    "",
  ].join("\n");
}

/** Provenance appendix for the metric ids a report actually used. */
function provenanceAppendix(metricIds: string[]) {
  const lines = ["## Data provenance and citations", "", BASIS_NOTE, ""];
  const seen = new Set<string>();
  for (const id of metricIds) {
    const p = METRIC_PROVENANCE[id];
    if (!p || seen.has(id)) continue;
    seen.add(id);
    lines.push(`### ${p.label}`);
    lines.push(`- Basis: **${p.basis}** · Confidence: **${p.confidence}** · Updated ${p.updated}`);
    lines.push(`- Definition: ${p.definition}`);
    lines.push(`- Method: ${p.method}`);
    lines.push(`- Inputs: ${p.inputs.join(", ")}`);
    if (p.caveat) lines.push(`- Caveat: ${p.caveat}`);
    lines.push(`- Sources:`);
    p.sources.forEach((s) => lines.push(`  - ${citationLine(s)}`));
    lines.push("");
  }
  return lines.join("\n");
}

function factSection(placeId: string) {
  const facts = PLACE_FACTS[placeId] ?? [];
  if (facts.length === 0) {
    return "## Verified statistics\n\nNo verified statistics are published for this geography yet. Atlas shows nothing rather than inventing a number.\n";
  }
  const rows = facts.map(
    (f) => `| ${f.label} | ${f.value} | ${f.basis} | ${f.source} | ${f.year} |`,
  );
  return [
    "## Verified statistics",
    "",
    "| Metric | Value | Basis | Source | Year |",
    "| --- | --- | --- | --- | --- |",
    ...rows,
    "",
    FACT_BASIS_NOTE,
    "",
  ].join("\n");
}

export function infrastructureThesis(place: Place, opportunities: Opportunity[]): Report {
  const score = rici(place.indicators);
  const band = riciBand(score);
  const md = [
    header(`Infrastructure Thesis — ${place.name}`, place.headline),
    "## Position",
    "",
    `${place.name} scores **${score.toFixed(1)}/100** on the Regenerative Infrastructure Capacity Index (${band.label}).`,
    "",
    `- Binding constraint: ${place.constraint}`,
    `- Becoming possible: ${place.becomingPossible}`,
    `- Population: ${place.population.toLocaleString()} · GDP per capita: $${place.gdpPerCapita.toLocaleString()}`,
    "",
    "## Index composition",
    "",
    "| Indicator | Weight | Score |",
    "| --- | --- | --- |",
    ...RICI_WEIGHTS.map((w) => `| ${w.label} | ${w.weight} | ${place.indicators[w.key]} |`),
    "",
    "## System status",
    "",
    "| System | Capacity | Demand | Growth | Risk |",
    "| --- | --- | --- | --- | --- |",
    ...Object.entries(place.systemStatus).map(
      ([id, s]) => `| ${id} | ${s.capacity} | ${s.demand} | ${s.growth} | ${s.risk} |`,
    ),
    "",
    factSection(place.id),
    "## Opportunities in scope",
    "",
    ...(opportunities.length
      ? opportunities.flatMap((o) => [
          `### ${o.code} — ${o.title}`,
          `- Capital: ${fmtUsdM(o.capitalUsdM)} · Beneficiaries: ${o.beneficiaries.toLocaleString()} · Resilience gain: +${o.resilienceGainPct}% · Confidence: ${o.confidence}`,
          `- Problem: ${o.problem}`,
          `- Opportunity: ${o.opportunity}`,
          `- Why now: ${o.whyNow}`,
          `- What could prevent it: ${o.whatCouldPrevent.join("; ")}`,
          "",
        ])
      : ["No opportunities are currently registered for this geography.", ""]),
    provenanceAppendix([
      "rici",
      "place.population",
      "place.gdpPerCapita",
      "system.capacity",
      "system.demand",
      "system.risk",
    ]),
  ].join("\n");

  return { title: `Infrastructure Thesis — ${place.name}`, filename: `atlas-thesis-${place.id}.md`, markdown: md };
}

export function futureScenario(
  place: Place,
  vars: ScenarioVars,
  out: ScenarioOutput,
  baseline: ScenarioOutput,
  presetLabel?: string,
): Report {
  const d = (a: number, b: number) => `${a - b > 0 ? "+" : ""}${(a - b).toFixed(1)}`;
  const md = [
    header(`Future Scenario — ${place.name}`, presetLabel ?? "Custom scenario"),
    "## Scenario variables",
    "",
    "| Variable | Value |",
    "| --- | --- |",
    ...VAR_META.map((m) => `| ${m.label} | ${vars[m.key]} ${m.suffix} |`),
    "",
    "## Modelled system response",
    "",
    "| Output | Scenario | Baseline | Δ |",
    "| --- | --- | --- | --- |",
    `| Energy demand (TWh/yr) | ${out.energyDemandTwh} | ${baseline.energyDemandTwh} | ${d(out.energyDemandTwh, baseline.energyDemandTwh)} |`,
    `| Compute load (MW) | ${out.computeLoadMw} | ${baseline.computeLoadMw} | ${d(out.computeLoadMw, baseline.computeLoadMw)} |`,
    `| Water demand (Mm³/yr) | ${out.waterDemandMm3} | ${baseline.waterDemandMm3} | ${d(out.waterDemandMm3, baseline.waterDemandMm3)} |`,
    `| Emissions (MtCO₂e) | ${out.emissionsMtco2e} | ${baseline.emissionsMtco2e} | ${d(out.emissionsMtco2e, baseline.emissionsMtco2e)} |`,
    `| Infrastructure gap ($B) | ${out.infrastructureGapUsdB} | ${baseline.infrastructureGapUsdB} | ${d(out.infrastructureGapUsdB, baseline.infrastructureGapUsdB)} |`,
    `| Capital requirement ($B) | ${out.capitalRequirementUsdB} | ${baseline.capitalRequirementUsdB} | ${d(out.capitalRequirementUsdB, baseline.capitalRequirementUsdB)} |`,
    `| People with access (M) | ${out.peopleWithAccessM} | ${baseline.peopleWithAccessM} | ${d(out.peopleWithAccessM, baseline.peopleWithAccessM)} |`,
    `| Resilience | ${out.resilience} | ${baseline.resilience} | ${d(out.resilience, baseline.resilience)} |`,
    `| Ecosystem health | ${out.ecosystemHealth} | ${baseline.ecosystemHealth} | ${d(out.ecosystemHealth, baseline.ecosystemHealth)} |`,
    `| RICI | ${out.ricIndex} | ${baseline.ricIndex} | ${d(out.ricIndex, baseline.ricIndex)} |`,
    "",
    "## What this future requires",
    "",
    `- Generation: ~${Math.round(out.energyDemandTwh * 0.19)} GW firm-equivalent at ${vars.renewablePenetration}% renewable share.`,
    `- Water: ${Math.round(out.waterDemandMm3 * 0.11)} Mm³/yr of new supply or reuse.`,
    `- Capital: $${out.capitalRequirementUsdB}B, roughly $${(out.capitalRequirementUsdB / 15).toFixed(1)}B per year.`,
    `- People: ~${Math.round(out.capitalRequirementUsdB * 4200).toLocaleString()} skilled roles.`,
    "",
    "## Trade-offs Atlas will not hide",
    "",
    `- Every output above is model output, not measurement. Local grid topology, land tenure and tariff politics are not represented.`,
    out.ecosystemHealth < 50 ? "- Ecosystem health falls below 50: the future is paid for with natural capital." : "",
    out.emissionsMtco2e > baseline.emissionsMtco2e ? "- Emissions rise against baseline: demand outruns the transition." : "",
    "",
    provenanceAppendix([
      "sim.energyDemandTwh",
      "sim.computeLoadMw",
      "sim.waterDemandMm3",
      "sim.emissionsMtco2e",
      "sim.infrastructureGapUsdB",
      "sim.capitalRequirementUsdB",
      "sim.peopleWithAccessM",
      "sim.resilience",
      "sim.ecosystemHealth",
      "sim.ricIndex",
    ]),
  ]
    .filter(Boolean)
    .join("\n");

  return { title: `Future Scenario — ${place.name}`, filename: `atlas-scenario-${place.id}.md`, markdown: md };
}

export function infrastructureBlueprint(
  place: Place,
  items: DesignItem[],
  totals: DesignTotals,
  componentLabel: (id: string) => string,
  integrity: { scores: Record<string, number>; overall: number },
): Report {
  const grouped = new Map<string, number>();
  items.forEach((i) => grouped.set(i.componentId, (grouped.get(i.componentId) ?? 0) + i.count));

  const md = [
    header(`Infrastructure Blueprint — ${place.name}`, "Component bill of quantities, resource balance and seven-capital assessment"),
    "## Bill of quantities",
    "",
    "| Component | Units |",
    "| --- | --- |",
    ...[...grouped.entries()].map(([id, n]) => `| ${componentLabel(id)} | ${n} |`),
    "",
    "## Resource and capital balance",
    "",
    `- Capex: ${fmtUsdM(totals.capexUsdM)}`,
    `- Net electricity: ${totals.netElectricityMw} MW`,
    `- Water balance: ${totals.waterM3d.toLocaleString()} m³/day`,
    `- Land take: ${totals.landHa.toLocaleString()} ha`,
    `- Jobs: ${totals.jobs.toLocaleString()}`,
    `- Net CO₂e: ${totals.co2Tpa.toLocaleString()} t/yr`,
    `- Beneficiaries: ${totals.beneficiaries.toLocaleString()}`,
    "",
    "## Seven capitals",
    "",
    "| Capital | Score |",
    "| --- | --- |",
    ...SEVEN_CAPITALS.map((c) => `| ${c.label} | ${totals.capitals[c.id as CapitalId]} |`),
    "",
    `Regenerative integrity: **${integrity.overall}/100**`,
    "",
    ...Object.entries(integrity.scores).map(([k, v]) => `- ${k}: ${v}`),
    "",
    "## Constraints Atlas flags",
    "",
    ...(totals.warnings.length
      ? totals.warnings.map((w) => `- **${w.level.toUpperCase()}** ${w.message} → ${w.suggestion}`)
      : ["- No blocking constraints detected at current sizing."]),
    "",
    provenanceAppendix([
      "design.capex",
      "design.electricity",
      "design.water",
      "design.land",
      "design.jobs",
      "design.co2",
      "design.beneficiaries",
      "design.capitals",
    ]),
  ].join("\n");

  return { title: `Infrastructure Blueprint — ${place.name}`, filename: `atlas-blueprint-${place.id}.md`, markdown: md };
}

export function capitalStrategy(
  opportunity: Opportunity,
  place: Place | undefined,
  stack: CapitalStack,
  analysis: {
    total: number;
    blendedCost: number;
    patience: number;
    riskAppetite: number;
    feasibility: number;
    annualDebtServiceUsdM: number;
  },
): Report {
  const md = [
    header(`Capital Strategy — ${opportunity.title}`, place ? `${place.name} · ${opportunity.code}` : opportunity.code),
    "## Requirement",
    "",
    `- Total capex: ${fmtUsdM(opportunity.capitalUsdM)}`,
    `- Beneficiaries: ${opportunity.beneficiaries.toLocaleString()}`,
    `- Resilience gain: +${opportunity.resilienceGainPct}%`,
    `- Sizing confidence: ${opportunity.confidence}`,
    "",
    "## Proposed stack",
    "",
    "| Source | Share | Cost of capital | Note |",
    "| --- | --- | --- | --- |",
    ...CAPITAL_SOURCES.filter((s) => (stack[s.id] ?? 0) > 0).map(
      (s) => `| ${s.label} | ${stack[s.id]}% | ${s.costOfCapital}% | ${s.note} |`,
    ),
    "",
    `Stack total: **${analysis.total}%**${analysis.total !== 100 ? " — the stack does not close; this is not yet a financing plan." : ""}`,
    "",
    "## Stack characteristics",
    "",
    `- Blended cost of capital: ${analysis.blendedCost}%`,
    `- Annual capital service: ${fmtUsdM(analysis.annualDebtServiceUsdM)}`,
    `- Patience: ${analysis.patience}/100`,
    `- Risk appetite: ${analysis.riskAppetite}/100`,
    `- Feasibility: ${analysis.feasibility}/100`,
    "",
    "## What could prevent close",
    "",
    ...opportunity.whatCouldPrevent.map((w) => `- ${w}`),
    "",
    "Indicative only. Not investment advice.",
    "",
    provenanceAppendix([
      "capital.capex",
      "capital.blendedCost",
      "capital.annualService",
      "capital.feasibility",
      "capital.patience",
      "capital.riskAppetite",
    ]),
  ].join("\n");

  return {
    title: `Capital Strategy — ${opportunity.title}`,
    filename: `atlas-capital-strategy-${opportunity.id}.md`,
    markdown: md,
  };
}

/** Browser-side download of a generated report. */
export function downloadReport(report: Report, format: "md" | "txt" = "md") {
  if (typeof window === "undefined") return;
  const blob = new Blob([report.markdown], {
    type: format === "md" ? "text/markdown;charset=utf-8" : "text/plain;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = report.filename.replace(/\.md$/, `.${format}`);
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Full project proposal for the flagship worked example: design, finance, stakeholders, budget. */
export function projectProposal(
  flagship: import("./flagship").Flagship,
  stack: CapitalStack,
  analysis: { blendedCost: number; feasibility: number; annualDebtServiceUsdM: number; total: number },
  partner?: { name: string; shareUsdM: number; score: number },
): Report {
  const f = flagship;
  const lines: string[] = [header(`Project Proposal — ${f.name}`, f.location)];
  lines.push("## Summary", "", f.summary, "", `**Why here:** ${f.whyHere}`, "");
  lines.push("## Technical design", "", "| Component | Specification |", "| --- | --- |");
  f.designItems.forEach((d) => lines.push(`| ${d.componentId} | ${d.label} |`));
  lines.push(
    "",
    `- Annual generation: ${f.annualGenerationGwh} GWh (capacity factor ${(f.capacityFactor * 100).toFixed(1)}%) — Modeled`,
    `- Offtake tariff: $${f.tariffUsdPerKwh}/kWh vs diesel-blended ~$${f.dieselDisplacedUsdPerKwh}/kWh — Estimated`,
    `- CO₂e avoided: ${f.co2AvoidedTpa.toLocaleString()} t/yr — Modeled`,
    `- Jobs: ${f.jobsConstruction} construction, ${f.jobsPermanent} permanent · Land: ${f.landHa} ha · Offtakers: ${f.offtakers}`,
    "",
  );
  lines.push("## Budget", "", `Total capex: **${fmtUsdM(f.capexUsdM)}**`, "", "| Line item | USD | Share | Basis | Note |", "| --- | --- | --- | --- | --- |");
  f.budget.forEach((b) => lines.push(`| ${b.item} | ${fmtUsdM(b.amountUsdM)} | ${b.share}% | ${b.basis} | ${b.note} |`));
  lines.push("", "## Capital stack", "", "| Source | Share | USD |", "| --- | --- | --- |");
  CAPITAL_SOURCES.filter((s) => (stack[s.id] ?? 0) > 0).forEach((s) =>
    lines.push(`| ${s.label} | ${stack[s.id]}% | ${fmtUsdM(((stack[s.id] ?? 0) / Math.max(1, analysis.total)) * f.capexUsdM)} |`),
  );
  lines.push(
    "",
    `- Blended cost of capital: ${analysis.blendedCost}% — Modeled`,
    `- Annual capital service: ${fmtUsdM(analysis.annualDebtServiceUsdM)} — Modeled`,
    `- Feasibility: ${analysis.feasibility}/100 — Modeled`,
  );
  if (partner) lines.push(`- Lead investment partner: **${partner.name}**, indicative ticket ${fmtUsdM(partner.shareUsdM)}, fit ${partner.score}/100`);
  lines.push("", "## Stakeholders", "", "| Stakeholder | Role | Interest | Commitment sought | Status |", "| --- | --- | --- | --- | --- |");
  f.stakeholders.forEach((s) => lines.push(`| ${s.name} | ${s.role} | ${s.interest} | ${s.commitment} | ${s.status} |`));
  lines.push("", "## Delivery plan", "");
  f.milestones.forEach((m) => lines.push(`- **${m.stage}** (${m.window}): ${m.gate}`));
  lines.push("", "## Risk register", "");
  f.risks.forEach((r) => lines.push(`- **${r.risk}** — ${r.mitigation}`));
  lines.push("", "## Benchmarks and sources", "");
  f.facts.forEach((x) => lines.push(`- ${x.label}: ${x.value} — **${x.basis}** · ${x.source} (${x.year})`));
  lines.push("", FACT_BASIS_NOTE, "", "_Indicative proposal. Budget lines are Atlas estimates benchmarked to the sources above and require EPC quotations before use._");
  return { title: `Project Proposal — ${f.name}`, filename: "atlas-proposal-athi-river.md", markdown: lines.join("\n") };
}
