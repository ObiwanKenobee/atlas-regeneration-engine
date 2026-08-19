// Atlas Sanctum — metric provenance registry.
// Every number rendered in the interface can be traced to an entry here:
// what it is, how it was produced, how confident Atlas is, and which sources
// the inputs came from.

export type MetricBasis = "Observed" | "Reported" | "Estimated" | "Modeled";
export type Confidence = "High" | "Medium" | "Low";

export type Citation = {
  name: string;
  publisher: string;
  year: number;
  url?: string;
};

export type MetricProvenance = {
  id: string;
  label: string;
  basis: MetricBasis;
  confidence: Confidence;
  /** Plain-language definition of the quantity. */
  definition: string;
  /** How the value is produced — formula or extraction method. */
  method: string;
  /** Named inputs the value depends on. */
  inputs: string[];
  /** Known limitations, so the number is never over-read. */
  caveat?: string;
  sources: Citation[];
  updated: number;
};

export const BASIS_COLOR: Record<MetricBasis, string> = {
  Observed: "var(--good)",
  Reported: "var(--accent)",
  Estimated: "var(--signal-energy)",
  Modeled: "var(--signal-compute)",
};

export const CONFIDENCE_PCT: Record<Confidence, number> = { High: 88, Medium: 58, Low: 30 };

export const BASIS_NOTE =
  "Observed = direct measurement. Reported = published by the named source. Estimated = Atlas estimate from partial public data. Modeled = model output, not a measurement.";

const IEA: Citation = { name: "Electricity 2025 / Energy & AI", publisher: "International Energy Agency", year: 2025, url: "https://www.iea.org" };
const IRENA: Citation = { name: "Renewable Capacity Statistics", publisher: "IRENA", year: 2025, url: "https://www.irena.org" };
const WB: Citation = { name: "World Development Indicators", publisher: "World Bank", year: 2024, url: "https://data.worldbank.org" };
const GIH: Citation = { name: "Global Infrastructure Outlook", publisher: "Global Infrastructure Hub", year: 2023, url: "https://outlook.gihub.org" };
const WRI: Citation = { name: "Aqueduct Water Risk Atlas 4.0", publisher: "World Resources Institute", year: 2023, url: "https://www.wri.org/aqueduct" };
const UN: Citation = { name: "World Population Prospects / WUP", publisher: "United Nations DESA", year: 2024, url: "https://population.un.org" };
const ATLAS_MODEL: Citation = { name: "Atlas scenario model v0.4 (deterministic)", publisher: "Atlas Sanctum", year: 2025 };
const ATLAS_DESIGN: Citation = { name: "Atlas component library — unit capex, load, land and labour factors", publisher: "Atlas Sanctum", year: 2025 };
const ATLAS_CAPITAL: Citation = { name: "Atlas capital model — weighted cost, patience, risk appetite", publisher: "Atlas Sanctum", year: 2025 };

const M = (m: MetricProvenance) => m;

export const METRIC_PROVENANCE: Record<string, MetricProvenance> = Object.fromEntries(
  [
    M({
      id: "rici",
      label: "RICI — Regenerative Infrastructure Capacity Index",
      basis: "Modeled",
      confidence: "Medium",
      definition: "Composite 0–100 index of a place's infrastructure capacity, access and regenerative quality.",
      method: "Weighted mean of ten indicators: Σ(indicator × weight), weights published in full on the Observe route.",
      inputs: ["capacity", "access", "affordability", "reliability", "resilience", "ecological integrity", "human benefit", "innovation capacity", "capital readiness", "future readiness"],
      caveat: "Indicator scores are Atlas normalisations of heterogeneous national datasets; cross-country comparison is directional.",
      sources: [IEA, WB, IRENA, WRI],
      updated: 2025,
    }),
    M({
      id: "place.population",
      label: "Population",
      basis: "Reported",
      confidence: "High",
      definition: "Resident population of the selected geography.",
      method: "National census or UN mid-year estimate; metro boundaries reconciled to UN World Urbanization Prospects.",
      inputs: ["national census", "UN WUP metro definition"],
      caveat: "Metro figures for rapidly urbanising cities are disputed by up to 20%.",
      sources: [UN, WB],
      updated: 2024,
    }),
    M({
      id: "place.gdpPerCapita",
      label: "GDP per capita",
      basis: "Reported",
      confidence: "High",
      definition: "Gross domestic product per person, current USD.",
      method: "World Bank national accounts; sub-national values apportioned by Atlas using regional GVA shares.",
      inputs: ["national accounts", "regional GVA share"],
      sources: [WB],
      updated: 2024,
    }),
    M({
      id: "system.capacity",
      label: "System capacity",
      basis: "Estimated",
      confidence: "Medium",
      definition: "Normalised 0–100 measure of installed serviceable capacity in a system for the selected place.",
      method: "Atlas normalisation of installed capacity per capita against the global distribution for that system.",
      inputs: ["installed capacity", "population", "global reference distribution"],
      caveat: "Available capacity often differs materially from installed capacity, especially in constrained grids.",
      sources: [IEA, IRENA, WRI],
      updated: 2025,
    }),
    M({
      id: "system.demand",
      label: "System demand",
      basis: "Estimated",
      confidence: "Medium",
      definition: "Normalised 0–100 measure of current demand pressure on a system.",
      method: "Atlas normalisation of measured consumption plus suppressed demand proxies (unserved population, queue depth).",
      inputs: ["consumption", "unserved population", "interconnection queue"],
      sources: [IEA, WB],
      updated: 2025,
    }),
    M({
      id: "system.risk",
      label: "System risk",
      basis: "Modeled",
      confidence: "Low",
      definition: "Composite exposure of a system to physical, resource and operational failure.",
      method: "Weighted blend of climate hazard exposure, water stress, single-point dependency count and reserve margin.",
      inputs: ["hazard exposure", "water stress", "dependency count", "reserve margin"],
      caveat: "No local grid topology or asset condition data is represented.",
      sources: [WRI, IEA, ATLAS_MODEL],
      updated: 2025,
    }),
    // ---- simulation outputs -------------------------------------------------
    M({
      id: "sim.energyDemandTwh",
      label: "Energy demand",
      basis: "Modeled",
      confidence: "Low",
      definition: "Annual electricity demand implied by the scenario, TWh/yr.",
      method: "base = population × GDP/capita ÷ 9000; scaled by energy-demand and population-growth variables, plus a compute-demand term.",
      inputs: ["population", "GDP per capita", "energy demand %", "population growth %", "compute demand %"],
      caveat: "Elasticities are constant; no price feedback or efficiency S-curve.",
      sources: [ATLAS_MODEL, IEA, WB],
      updated: 2025,
    }),
    M({
      id: "sim.computeLoadMw",
      label: "Compute load",
      basis: "Modeled",
      confidence: "Low",
      definition: "IT load of data-centre capacity implied by the scenario, MW.",
      method: "compute system capacity × (population scale + 4) × (1 + compute demand %).",
      inputs: ["compute capacity", "population", "compute demand %"],
      caveat: "Interconnection queues are speculative; most requested load is never built.",
      sources: [ATLAS_MODEL, IEA],
      updated: 2025,
    }),
    M({
      id: "sim.waterDemandMm3",
      label: "Water demand",
      basis: "Modeled",
      confidence: "Low",
      definition: "Annual water withdrawal implied by the scenario, million m³/yr.",
      method: "population × 42 m³ × urbanisation factor + compute load × 0.012, discounted by technology adoption.",
      inputs: ["population", "urbanisation %", "compute load", "technology adoption"],
      caveat: "Agricultural withdrawal, by far the largest term in most basins, is held constant.",
      sources: [ATLAS_MODEL, WRI],
      updated: 2025,
    }),
    M({
      id: "sim.emissionsMtco2e",
      label: "Emissions",
      basis: "Modeled",
      confidence: "Low",
      definition: "Operational emissions of the electricity system, MtCO₂e/yr.",
      method: "energy demand × 0.42 tCO₂e/MWh × (1 − renewable share ÷ 115) − restoration sequestration term.",
      inputs: ["energy demand", "renewable penetration %", "ecosystem restoration %"],
      caveat: "Embodied and non-energy emissions are excluded.",
      sources: [ATLAS_MODEL, IEA],
      updated: 2025,
    }),
    M({
      id: "sim.infrastructureGapUsdB",
      label: "Infrastructure gap",
      basis: "Modeled",
      confidence: "Low",
      definition: "Unfunded investment need over the scenario horizon, USD billions.",
      method: "(energy × 1.7 + water × 0.02 + population × 0.9) × (1 − investment effect × 0.45).",
      inputs: ["energy demand", "water demand", "population", "investment %"],
      sources: [ATLAS_MODEL, GIH],
      updated: 2025,
    }),
    M({
      id: "sim.capitalRequirementUsdB",
      label: "Capital requirement",
      basis: "Modeled",
      confidence: "Low",
      definition: "Total capital needed including compute build-out, USD billions.",
      method: "infrastructure gap × 1.25 + compute load × 0.011.",
      inputs: ["infrastructure gap", "compute load"],
      sources: [ATLAS_MODEL, GIH],
      updated: 2025,
    }),
    M({
      id: "sim.peopleWithAccessM",
      label: "People with access",
      basis: "Modeled",
      confidence: "Low",
      definition: "Population with reliable service under the scenario, millions.",
      method: "population × growth × access indicator adjusted by investment and technology adoption ÷ 100.",
      inputs: ["population", "access indicator", "investment %", "technology adoption"],
      sources: [ATLAS_MODEL, WB],
      updated: 2025,
    }),
    M({
      id: "sim.economicActivityIndex",
      label: "Economic activity",
      basis: "Modeled",
      confidence: "Low",
      definition: "Relative index (0–140) of economic activity enabled by the infrastructure state.",
      method: "45 + investment, technology, compute and population terms, less water-shortfall and climate-pressure penalties.",
      inputs: ["investment %", "technology adoption", "compute demand", "water supply index", "climate pressure"],
      caveat: "An index, not a GDP forecast.",
      sources: [ATLAS_MODEL],
      updated: 2025,
    }),
    M({
      id: "sim.resilience",
      label: "Resilience",
      basis: "Modeled",
      confidence: "Low",
      definition: "Ability of the system to absorb shocks and recover, 0–100.",
      method: "baseline resilience + investment, renewables, restoration and technology terms − climate pressure, unfunded demand growth and water loss.",
      inputs: ["resilience indicator", "investment %", "renewable %", "restoration %", "climate pressure", "water availability"],
      sources: [ATLAS_MODEL, WRI],
      updated: 2025,
    }),
    M({
      id: "sim.ecosystemHealth",
      label: "Ecosystem health",
      basis: "Modeled",
      confidence: "Low",
      definition: "Ecological integrity under the scenario, 0–100.",
      method: "baseline ecological integrity + restoration × 0.42 − urbanisation, climate pressure and energy-demand penalties.",
      inputs: ["ecological integrity", "restoration %", "urbanisation %", "climate pressure"],
      sources: [ATLAS_MODEL, WRI],
      updated: 2025,
    }),
    M({
      id: "sim.ricIndex",
      label: "Scenario RICI",
      basis: "Modeled",
      confidence: "Low",
      definition: "RICI recomputed on the indicator set the scenario produces.",
      method: "Each indicator adjusted by scenario variables, then the published RICI weighting applied.",
      inputs: ["all ten indicators", "all scenario variables"],
      sources: [ATLAS_MODEL],
      updated: 2025,
    }),
    // ---- design studio ------------------------------------------------------
    M({
      id: "design.capex",
      label: "Design capex",
      basis: "Estimated",
      confidence: "Medium",
      definition: "Total capital cost of the placed components.",
      method: "Σ(unit capex × count) using Atlas component library factors.",
      inputs: ["component unit capex", "component counts"],
      caveat: "Excludes land acquisition, financing costs and country risk premia.",
      sources: [ATLAS_DESIGN, IRENA],
      updated: 2025,
    }),
    M({
      id: "design.electricity",
      label: "Net electricity",
      basis: "Estimated",
      confidence: "Medium",
      definition: "Net electricity balance of the design: generation minus load, MW.",
      method: "Σ(unit MW × count); generation positive, load negative.",
      inputs: ["component MW factors", "component counts"],
      sources: [ATLAS_DESIGN, IEA],
      updated: 2025,
    }),
    M({
      id: "design.water",
      label: "Water balance",
      basis: "Estimated",
      confidence: "Medium",
      definition: "Net water balance of the design, m³/day.",
      method: "Σ(unit m³/day × count); treatment/reuse negative, consumption positive.",
      inputs: ["component water factors", "component counts"],
      sources: [ATLAS_DESIGN, WRI],
      updated: 2025,
    }),
    M({
      id: "design.land",
      label: "Land take",
      basis: "Estimated",
      confidence: "Medium",
      definition: "Total land footprint, hectares.",
      method: "Σ(unit ha × count).",
      inputs: ["component land factors", "component counts"],
      caveat: "Setbacks, easements and access roads are not modelled.",
      sources: [ATLAS_DESIGN],
      updated: 2025,
    }),
    M({
      id: "design.jobs",
      label: "Jobs",
      basis: "Estimated",
      confidence: "Low",
      definition: "Direct operating roles supported by the design.",
      method: "Σ(unit jobs × count); indirect and induced employment excluded.",
      inputs: ["component labour factors", "component counts"],
      sources: [ATLAS_DESIGN, IRENA],
      updated: 2025,
    }),
    M({
      id: "design.co2",
      label: "Net CO₂e",
      basis: "Estimated",
      confidence: "Low",
      definition: "Net annual operational emissions of the design, tCO₂e/yr.",
      method: "Σ(unit tCO₂e/yr × count); sequestration components carry negative factors.",
      inputs: ["component emission factors", "component counts"],
      caveat: "Embodied carbon of construction is not included.",
      sources: [ATLAS_DESIGN],
      updated: 2025,
    }),
    M({
      id: "design.beneficiaries",
      label: "Beneficiaries",
      basis: "Modeled",
      confidence: "Low",
      definition: "People materially served by the design.",
      method: "jobs × 4.2 household multiplier + water and electricity service coefficients.",
      inputs: ["jobs", "net water", "net electricity"],
      caveat: "A coarse multiplier; treat as an order of magnitude.",
      sources: [ATLAS_DESIGN, UN],
      updated: 2025,
    }),
    M({
      id: "design.capitals",
      label: "Seven capitals contribution",
      basis: "Modeled",
      confidence: "Low",
      definition: "Contribution of the design to each of the seven capitals, 0–100.",
      method: "Count-weighted mean of per-component capital scores.",
      inputs: ["component capital profiles", "component counts"],
      caveat: "Capital scores are expert judgement, not measurement.",
      sources: [ATLAS_DESIGN],
      updated: 2025,
    }),
    // ---- capital ------------------------------------------------------------
    M({
      id: "capital.capex",
      label: "Total capex",
      basis: "Estimated",
      confidence: "Medium",
      definition: "Capital requirement of the selected opportunity.",
      method: "Atlas opportunity sizing from comparable projects and unit-cost benchmarks.",
      inputs: ["opportunity scope", "unit cost benchmarks"],
      sources: [GIH, ATLAS_DESIGN],
      updated: 2025,
    }),
    M({
      id: "capital.blendedCost",
      label: "Blended cost of capital",
      basis: "Modeled",
      confidence: "Medium",
      definition: "Weighted average cost of the capital stack, % per year.",
      method: "Σ(share × source cost of capital) over the stack, normalised to the stack total.",
      inputs: ["stack shares", "per-source cost of capital"],
      caveat: "Indicative only; not investment advice. Currency and country risk are not priced.",
      sources: [ATLAS_CAPITAL, GIH],
      updated: 2025,
    }),
    M({
      id: "capital.annualService",
      label: "Annual capital service",
      basis: "Modeled",
      confidence: "Medium",
      definition: "Annual cost of servicing the stack.",
      method: "capex × blended cost of capital.",
      inputs: ["capex", "blended cost"],
      sources: [ATLAS_CAPITAL],
      updated: 2025,
    }),
    M({
      id: "capital.feasibility",
      label: "Feasibility",
      basis: "Modeled",
      confidence: "Low",
      definition: "Likelihood the stack can actually close, 0–100.",
      method: "38 + (12 − blended cost) × 4.2 + patience and risk-appetite terms, penalised where the stack does not total 100%.",
      inputs: ["blended cost", "patience", "risk appetite", "stack total"],
      caveat: "Ignores sponsor track record, regulatory approval and offtake credit quality.",
      sources: [ATLAS_CAPITAL],
      updated: 2025,
    }),
    M({
      id: "capital.patience",
      label: "Patience",
      basis: "Modeled",
      confidence: "Low",
      definition: "Tolerance of the stack for long payback horizons, 0–100.",
      method: "Share-weighted mean of per-source patience scores.",
      inputs: ["stack shares", "per-source patience"],
      sources: [ATLAS_CAPITAL],
      updated: 2025,
    }),
    M({
      id: "capital.riskAppetite",
      label: "Risk appetite",
      basis: "Modeled",
      confidence: "Low",
      definition: "Tolerance of the stack for construction and offtake risk, 0–100.",
      method: "Share-weighted mean of per-source risk appetite scores.",
      inputs: ["stack shares", "per-source risk appetite"],
      sources: [ATLAS_CAPITAL],
      updated: 2025,
    }),
    // ---- radar / frontiers --------------------------------------------------
    M({
      id: "radar.frontier",
      label: "Emerging frontier movement",
      basis: "Estimated",
      confidence: "Medium",
      definition: "Direction and magnitude of change on an emerging infrastructure frontier.",
      method: "Atlas composite of published capacity, investment and queue data, differenced year on year.",
      inputs: ["capacity additions", "investment flows", "interconnection queues"],
      sources: [IEA, IRENA, GIH],
      updated: 2025,
    }),
  ].map((m) => [m.id, m]),
);

export function provenanceFor(id: string): MetricProvenance | undefined {
  return METRIC_PROVENANCE[id];
}

export function citationLine(c: Citation): string {
  return `${c.publisher} — ${c.name} (${c.year})${c.url ? ` · ${c.url}` : ""}`;
}
