// Atlas Sanctum — transparent models.
// No decorative numbers: every output below is a stated function of stated inputs.

import {
  CAPITAL_SOURCES,
  DESIGN_COMPONENTS,
  PLACE_BY_ID,
  type CapitalId,
  type DesignComponent,
  type Indicators,
  type Place,
} from "./data";

export const RICI_WEIGHTS: Array<{ key: keyof Indicators; label: string; weight: number }> = [
  { key: "capacity", label: "Capacity", weight: 0.12 },
  { key: "access", label: "Access", weight: 0.12 },
  { key: "affordability", label: "Affordability", weight: 0.1 },
  { key: "reliability", label: "Reliability", weight: 0.11 },
  { key: "resilience", label: "Resilience", weight: 0.12 },
  { key: "ecologicalIntegrity", label: "Ecological integrity", weight: 0.12 },
  { key: "humanBenefit", label: "Human benefit", weight: 0.11 },
  { key: "innovationCapacity", label: "Innovation capacity", weight: 0.07 },
  { key: "capitalReadiness", label: "Capital readiness", weight: 0.07 },
  { key: "futureReadiness", label: "Future readiness", weight: 0.06 },
];

/** Regenerative Infrastructure Capacity Index — weighted mean of ten indicators. */
export function rici(indicators: Indicators): number {
  const total = RICI_WEIGHTS.reduce((sum, w) => sum + indicators[w.key] * w.weight, 0);
  return Math.round(total * 10) / 10;
}

export function riciBand(score: number): { label: string; color: string } {
  if (score >= 70) return { label: "Regenerative", color: "var(--good)" };
  if (score >= 55) return { label: "Adequate", color: "var(--primary)" };
  if (score >= 40) return { label: "Strained", color: "var(--warn)" };
  return { label: "Critical deficit", color: "var(--danger)" };
}

export type ScenarioVars = {
  computeDemand: number; // % change
  populationGrowth: number;
  energyDemand: number;
  renewablePenetration: number; // absolute % of mix
  waterAvailability: number; // % change
  investment: number; // % change
  urbanisation: number;
  climatePressure: number;
  ecosystemRestoration: number;
  technologyAdoption: number;
};

export const DEFAULT_VARS: ScenarioVars = {
  computeDemand: 40,
  populationGrowth: 18,
  energyDemand: 35,
  renewablePenetration: 55,
  waterAvailability: -8,
  investment: 25,
  urbanisation: 22,
  climatePressure: 30,
  ecosystemRestoration: 15,
  technologyAdoption: 40,
};

export const VAR_META: Array<{
  key: keyof ScenarioVars;
  label: string;
  min: number;
  max: number;
  suffix: string;
}> = [
  { key: "computeDemand", label: "AI compute demand", min: 0, max: 500, suffix: "%" },
  { key: "populationGrowth", label: "Population growth", min: -10, max: 120, suffix: "%" },
  { key: "energyDemand", label: "Energy demand", min: -20, max: 250, suffix: "%" },
  { key: "renewablePenetration", label: "Renewable penetration", min: 0, max: 100, suffix: "% of mix" },
  { key: "waterAvailability", label: "Water availability", min: -60, max: 60, suffix: "%" },
  { key: "investment", label: "Infrastructure investment", min: -50, max: 300, suffix: "%" },
  { key: "urbanisation", label: "Urbanisation", min: 0, max: 120, suffix: "%" },
  { key: "climatePressure", label: "Climate pressure", min: 0, max: 100, suffix: "index" },
  { key: "ecosystemRestoration", label: "Ecosystem restoration", min: 0, max: 100, suffix: "% of degraded land" },
  { key: "technologyAdoption", label: "Technology adoption", min: 0, max: 100, suffix: "index" },
];

export const SCENARIO_PRESETS: Array<{ id: string; label: string; note: string; vars: ScenarioVars }> = [
  {
    id: "bau",
    label: "Business as usual",
    note: "Current trajectories extended to 2040 with no structural change.",
    vars: { computeDemand: 90, populationGrowth: 22, energyDemand: 45, renewablePenetration: 42, waterAvailability: -12, investment: 15, urbanisation: 30, climatePressure: 45, ecosystemRestoration: 8, technologyAdoption: 45 },
  },
  {
    id: "accelerated",
    label: "Accelerated growth",
    note: "Rapid industrialisation without matched ecological investment.",
    vars: { computeDemand: 180, populationGrowth: 35, energyDemand: 110, renewablePenetration: 48, waterAvailability: -20, investment: 120, urbanisation: 65, climatePressure: 58, ecosystemRestoration: 10, technologyAdoption: 70 },
  },
  {
    id: "regenerative",
    label: "Regenerative transition",
    note: "Investment weighted toward restoration, access and resilience.",
    vars: { computeDemand: 110, populationGrowth: 20, energyDemand: 55, renewablePenetration: 88, waterAvailability: 10, investment: 150, urbanisation: 30, climatePressure: 32, ecosystemRestoration: 72, technologyAdoption: 78 },
  },
  {
    id: "supercompute",
    label: "AI supercompute",
    note: "Compute demand dominates the grid and the capital stack.",
    vars: { computeDemand: 460, populationGrowth: 18, energyDemand: 160, renewablePenetration: 60, waterAvailability: -25, investment: 190, urbanisation: 34, climatePressure: 50, ecosystemRestoration: 12, technologyAdoption: 95 },
  },
  {
    id: "climate-stress",
    label: "Climate stress",
    note: "High physical risk, constrained water, sluggish capital.",
    vars: { computeDemand: 70, populationGrowth: 24, energyDemand: 60, renewablePenetration: 46, waterAvailability: -45, investment: 5, urbanisation: 48, climatePressure: 92, ecosystemRestoration: 14, technologyAdoption: 40 },
  },
  {
    id: "abundant-energy",
    label: "Abundant energy",
    note: "Electricity becomes cheap, firm and widely available.",
    vars: { computeDemand: 220, populationGrowth: 20, energyDemand: 140, renewablePenetration: 95, waterAvailability: 5, investment: 170, urbanisation: 38, climatePressure: 30, ecosystemRestoration: 45, technologyAdoption: 88 },
  },
  {
    id: "renaissance",
    label: "African renaissance",
    note: "Capital cost falls; industrial and human capacity compound.",
    vars: { computeDemand: 250, populationGrowth: 45, energyDemand: 130, renewablePenetration: 82, waterAvailability: 0, investment: 240, urbanisation: 55, climatePressure: 38, ecosystemRestoration: 55, technologyAdoption: 85 },
  },
];

export type ScenarioOutput = {
  energyDemandTwh: number;
  computeLoadMw: number;
  waterDemandMm3: number;
  infrastructureGapUsdB: number;
  economicActivityIndex: number;
  emissionsMtco2e: number;
  resilience: number;
  ecosystemHealth: number;
  capitalRequirementUsdB: number;
  peopleWithAccessM: number;
  ricIndex: number;
};

const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));

/** Deterministic system model. Documented in the methodology drawer. */
export function simulate(place: Place, v: ScenarioVars): ScenarioOutput {
  const popM = place.population / 1_000_000;
  const baseEnergyTwh = (popM * place.gdpPerCapita) / 9000; // proxy from population × income
  const energyDemandTwh = baseEnergyTwh * (1 + v.energyDemand / 100) * (1 + v.populationGrowth / 300) +
    (v.computeDemand / 100) * Math.max(0.4, popM / 90) * 6;

  const computeLoadMw =
    Math.max(20, place.systemStatus.compute.capacity * (popM / 12 + 4)) * (1 + v.computeDemand / 100);

  const waterDemandMm3 =
    popM * 42 * (1 + v.populationGrowth / 100) * (1 + v.urbanisation / 260) +
    computeLoadMw * 0.012 * (1 - v.technologyAdoption / 220);

  const waterSupplyIndex = clamp(
    place.systemStatus.water.capacity * (1 + v.waterAvailability / 100) +
      v.ecosystemRestoration * 0.22 -
      v.climatePressure * 0.28,
  );

  const emissionsMtco2e = Math.max(
    0,
    energyDemandTwh * 0.42 * (1 - v.renewablePenetration / 115) -
      (v.ecosystemRestoration / 100) * popM * 0.06,
  );

  const investmentEffect = v.investment / 100;
  const resilience = clamp(
    place.indicators.resilience +
      investmentEffect * 16 +
      v.renewablePenetration * 0.16 +
      v.ecosystemRestoration * 0.13 +
      v.technologyAdoption * 0.06 -
      v.climatePressure * 0.35 -
      Math.max(0, v.energyDemand - v.investment) * 0.07 -
      Math.max(0, -v.waterAvailability) * 0.22,
  );

  const ecosystemHealth = clamp(
    place.indicators.ecologicalIntegrity +
      v.ecosystemRestoration * 0.42 -
      v.urbanisation * 0.2 -
      v.climatePressure * 0.24 -
      Math.max(0, v.energyDemand) * 0.05 +
      v.renewablePenetration * 0.08,
  );

  const economicActivityIndex = clamp(
    45 +
      investmentEffect * 22 +
      v.technologyAdoption * 0.2 +
      v.computeDemand * 0.03 +
      v.populationGrowth * 0.12 -
      Math.max(0, 60 - waterSupplyIndex) * 0.24 -
      v.climatePressure * 0.12,
    0,
    140,
  );

  const infrastructureGapUsdB = Math.max(
    0,
    (energyDemandTwh * 1.7 + waterDemandMm3 * 0.02 + popM * 0.9) * (1 - investmentEffect * 0.45),
  );

  const capitalRequirementUsdB = infrastructureGapUsdB * 1.25 + computeLoadMw * 0.011;

  const peopleWithAccessM =
    (popM * (1 + v.populationGrowth / 100) * clamp(place.indicators.access + investmentEffect * 22 + v.technologyAdoption * 0.12)) / 100;

  const ricIndex = rici({
    ...place.indicators,
    capacity: clamp(place.indicators.capacity + investmentEffect * 20 - v.energyDemand * 0.1),
    access: clamp(place.indicators.access + investmentEffect * 16 + v.technologyAdoption * 0.1),
    affordability: clamp(place.indicators.affordability + v.renewablePenetration * 0.1 - v.climatePressure * 0.14),
    reliability: clamp(place.indicators.reliability + investmentEffect * 18 - Math.max(0, v.energyDemand - v.investment) * 0.12),
    resilience,
    ecologicalIntegrity: ecosystemHealth,
    humanBenefit: clamp(place.indicators.humanBenefit + investmentEffect * 12 + v.ecosystemRestoration * 0.1 - v.climatePressure * 0.14),
    innovationCapacity: clamp(place.indicators.innovationCapacity + v.technologyAdoption * 0.22),
    capitalReadiness: clamp(place.indicators.capitalReadiness + investmentEffect * 24),
    futureReadiness: clamp(place.indicators.futureReadiness + v.renewablePenetration * 0.12 + v.technologyAdoption * 0.12 - v.climatePressure * 0.2),
  });

  return {
    energyDemandTwh: round(energyDemandTwh, 1),
    computeLoadMw: Math.round(computeLoadMw),
    waterDemandMm3: round(waterDemandMm3, 0),
    infrastructureGapUsdB: round(infrastructureGapUsdB, 1),
    economicActivityIndex: round(economicActivityIndex, 1),
    emissionsMtco2e: round(emissionsMtco2e, 1),
    resilience: round(resilience, 1),
    ecosystemHealth: round(ecosystemHealth, 1),
    capitalRequirementUsdB: round(capitalRequirementUsdB, 1),
    peopleWithAccessM: round(peopleWithAccessM, 1),
    ricIndex: round(ricIndex, 1),
  };
}

function round(v: number, d: number) {
  const f = 10 ** d;
  return Math.round(v * f) / f;
}

export type DesignItem = { componentId: string; count: number; x: number; y: number; id: string };

export type DesignTotals = {
  capexUsdM: number;
  netElectricityMw: number;
  waterM3d: number;
  landHa: number;
  jobs: number;
  co2Tpa: number;
  beneficiaries: number;
  capitals: Record<CapitalId, number>;
  warnings: Array<{ level: "critical" | "warning"; message: string; suggestion: string }>;
};

const COMPONENT_BY_ID = Object.fromEntries(DESIGN_COMPONENTS.map((c) => [c.id, c])) as Record<
  string,
  DesignComponent
>;

export function designTotals(items: DesignItem[], placeId: string): DesignTotals {
  const place = (PLACE_BY_ID[placeId] ?? PLACE_BY_ID["nairobi"]) as Place;
  const capitals: Record<CapitalId, number> = {
    financial: 0, human: 0, social: 0, natural: 0, knowledge: 0, technological: 0, cultural: 0,
  };
  let capex = 0, mw = 0, water = 0, land = 0, jobs = 0, co2 = 0, weight = 0;

  for (const item of items) {
    const c = COMPONENT_BY_ID[item.componentId];
    if (!c) continue;
    const n = item.count;
    capex += c.capexPerUnitUsdM * n;
    mw += c.electricityMw * n;
    water += c.waterM3d * n;
    land += c.landHa * n;
    jobs += c.jobs * n;
    co2 += c.co2Tpa * n;
    weight += n;
    (Object.keys(capitals) as CapitalId[]).forEach((k) => {
      capitals[k] += c.capitals[k] * n;
    });
  }
  if (weight > 0) {
    (Object.keys(capitals) as CapitalId[]).forEach((k) => {
      capitals[k] = Math.round(capitals[k] / weight);
    });
  }

  // Headroom derived from the place's system status (capacity minus demand).
  const gridHeadroomMw = Math.max(
    15,
    (place.systemStatus.energy.capacity - place.systemStatus.energy.demand + 40) * (place.population / 1_000_000) * 0.9,
  );
  const waterHeadroomM3d = Math.max(
    5000,
    (place.systemStatus.water.capacity - place.systemStatus.water.demand + 50) * (place.population / 1_000_000) * 320,
  );

  const warnings: DesignTotals["warnings"] = [];
  if (mw > gridHeadroomMw) {
    const deficit = Math.ceil(mw - gridHeadroomMw);
    warnings.push({
      level: "critical",
      message: `This intervention increases electricity demand beyond current grid capacity by ~${deficit} MW.`,
      suggestion: `Add ${Math.ceil(deficit * 1.35)} MW renewable generation + ${Math.ceil(deficit * 3.2)} MWh storage, or contract curtailable load.`,
    });
  }
  if (water > waterHeadroomM3d) {
    const deficit = Math.ceil(water - waterHeadroomM3d);
    warnings.push({
      level: "critical",
      message: `Water demand exceeds available supply by ~${deficit.toLocaleString()} m³/day.`,
      suggestion: `Add ${Math.ceil(deficit / 20000)} × 20,000 m³/d reuse capacity, or specify closed-loop cooling.`,
    });
  }
  if (co2 > 0 && items.length > 0) {
    warnings.push({
      level: "warning",
      message: `Net emissions are positive at ${Math.round(co2).toLocaleString()} tCO₂e/year.`,
      suggestion: `Add renewable generation or ${Math.ceil(co2 / 7800)} × 1,000 ha forest restoration to reach net-negative.`,
    });
  }
  if (capitals.social < 50 && items.length > 0) {
    warnings.push({
      level: "warning",
      message: "Social capital contribution is low: this design is not yet legible to the community that hosts it.",
      suggestion: "Add community-owned components (microgrid, school, housing) or a local ownership tranche.",
    });
  }
  if (capitals.natural < 45 && items.length > 0) {
    warnings.push({
      level: "warning",
      message: "Natural capital is being drawn down rather than rebuilt.",
      suggestion: "Add wetland or forest restoration sized to at least 15% of project footprint.",
    });
  }

  return {
    capexUsdM: round(capex, 1),
    netElectricityMw: round(mw, 1),
    waterM3d: Math.round(water),
    landHa: Math.round(land),
    jobs: Math.round(jobs),
    co2Tpa: Math.round(co2),
    beneficiaries: Math.round(jobs * 4.2 + Math.max(0, -water) * 12 + Math.max(0, -mw) * 900),
    capitals,
    warnings,
  };
}

export type CapitalStack = Record<string, number>;

export const DEFAULT_STACK: CapitalStack = {
  government: 20,
  dfi: 25,
  private: 35,
  climate: 10,
  community: 5,
  philanthropic: 5,
};

export function stackAnalysis(stack: CapitalStack, capexUsdM: number) {
  const total = Object.values(stack).reduce((a, b) => a + b, 0);
  const sources = CAPITAL_SOURCES.filter((s) => (stack[s.id] ?? 0) > 0);
  const norm = total === 0 ? 1 : total;
  const blendedCost = sources.reduce((sum, s) => sum + ((stack[s.id] ?? 0) / norm) * s.costOfCapital, 0);
  const patience = sources.reduce((sum, s) => sum + ((stack[s.id] ?? 0) / norm) * s.patience, 0);
  const riskAppetite = sources.reduce((sum, s) => sum + ((stack[s.id] ?? 0) / norm) * s.riskAppetite, 0);
  const feasibility = clamp(
    38 + (12 - blendedCost) * 4.2 + patience * 0.24 + riskAppetite * 0.22 - Math.abs(100 - total) * 0.8,
  );
  const annualDebtServiceUsdM = round((capexUsdM * blendedCost) / 100, 1);
  return {
    total,
    blendedCost: round(blendedCost, 2),
    patience: round(patience, 0),
    riskAppetite: round(riskAppetite, 0),
    feasibility: round(feasibility, 0),
    annualDebtServiceUsdM,
  };
}

export const INTEGRITY_CRITERIA = [
  "Human benefit",
  "Ecological integrity",
  "Intergenerational impact",
  "Equity",
  "Transparency",
  "Resilience",
  "Community participation",
  "Long-term reversibility",
  "Resource consumption",
  "Dependency risk",
] as const;

export function integrityAssessment(capitals: Record<CapitalId, number>, co2Tpa: number) {
  const c = capitals;
  const scores: Record<string, number> = {
    "Human benefit": Math.round((c.human + c.social) / 2),
    "Ecological integrity": Math.round(clamp(c.natural - (co2Tpa > 0 ? 15 : -8))),
    "Intergenerational impact": Math.round(clamp((c.natural + c.knowledge + c.cultural) / 3)),
    Equity: Math.round(clamp((c.social + c.human) / 2 - (c.financial > 80 ? 10 : 0))),
    Transparency: Math.round(clamp(c.knowledge * 0.7 + 25)),
    Resilience: Math.round(clamp((c.technological + c.natural) / 2)),
    "Community participation": Math.round(c.social),
    "Long-term reversibility": Math.round(clamp(100 - c.technological * 0.45 - (co2Tpa > 0 ? 12 : 0))),
    "Resource consumption": Math.round(clamp(100 - Math.max(0, co2Tpa) / 400 - (100 - c.natural) * 0.5)),
    "Dependency risk": Math.round(clamp(100 - c.technological * 0.5 - c.financial * 0.25)),
  };
  const overall = Math.round(
    Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length,
  );
  return { scores, overall };
}

export const fmtUsdM = (v: number) =>
  v >= 1000 ? `$${(v / 1000).toFixed(2)}B` : `$${Math.round(v)}M`;

export const fmtNum = (v: number) => {
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return `${Math.round(v)}`;
};
