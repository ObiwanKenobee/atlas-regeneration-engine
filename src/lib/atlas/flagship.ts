// Atlas Sanctum — flagship worked example.
// Athi River Solar + Storage: a real, specific Nairobi-region project carried
// through the whole lifecycle — design, finance, proposal.
// Costs are benchmarked to published Kenyan tariffs and IRENA cost data.

import type { CapitalStack } from "./model";
import type { FactBasis } from "./data";

export type BudgetLine = {
  item: string;
  amountUsdM: number;
  share: number;
  basis: FactBasis;
  note: string;
};

export type Stakeholder = {
  name: string;
  role: string;
  interest: string;
  commitment: string;
  status: "Engaged" | "Identified" | "Approached" | "Committed";
};

export type Milestone = { stage: string; window: string; gate: string };

export const FLAGSHIP = {
  id: "prj-athi-river",
  name: "Athi River Solar + Storage",
  placeId: "nairobi",
  location: "Athi River / Mavoko, Machakos County — Nairobi metropolitan industrial belt",
  summary:
    "A 40 MWp solar plant with 60 MWh of battery storage, wheeled over the Kenya Power network to eleven industrial offtakers in the Athi River and Mavoko export processing zones, replacing diesel backup and shaving evening peak charges.",
  whyHere:
    "Athi River carries Nairobi's densest industrial load, sits on flat under-used ranch land 30 km from the CBD, and is already inside the 132 kV ring — so interconnection is an upgrade, not a new line.",
  designItems: [
    { componentId: "solar", count: 4, label: "Solar PV · 4 × 10 MW = 40 MWp" },
    { componentId: "battery", count: 3, label: "Battery storage · 3 × 20 MWh = 60 MWh" },
    { componentId: "microgrid", count: 2, label: "Industrial microgrid controllers · 2 sites" },
    { componentId: "fiber", count: 1, label: "Fibre + control network · 100 km" },
  ],
  capexUsdM: 57.4,
  annualGenerationGwh: 78,
  capacityFactor: 0.223,
  tariffUsdPerKwh: 0.078,
  dieselDisplacedUsdPerKwh: 0.31,
  co2AvoidedTpa: 34_500,
  jobsConstruction: 420,
  jobsPermanent: 38,
  landHa: 74,
  offtakers: 11,
  stack: { dfi: 35, private: 25, climate: 20, government: 12, community: 8 } as CapitalStack,
  facts: [
    { label: "Solar resource, Athi River", value: "~5.6 kWh/m²/day GHI", basis: "Reported" as FactBasis, source: "Global Solar Atlas (World Bank / Solargis)", year: 2024 },
    { label: "Utility-scale solar capex benchmark", value: "~$0.80–1.00/W in East Africa", basis: "Reported" as FactBasis, source: "IRENA Renewable Power Generation Costs", year: 2024 },
    { label: "Battery pack price benchmark", value: "~$115/kWh at pack level", basis: "Reported" as FactBasis, source: "BloombergNEF battery price survey", year: 2024 },
    { label: "Kenya commercial-industrial tariff", value: "~KES 19–24/kWh", basis: "Reported" as FactBasis, source: "EPRA approved tariff schedule", year: 2024 },
    { label: "Diesel backup cost", value: "~$0.30–0.35/kWh all-in", basis: "Estimated" as FactBasis, source: "Atlas from Kenyan industrial genset operating data", year: 2024 },
    { label: "Wheeling framework", value: "Open access rules in force", basis: "Reported" as FactBasis, source: "Energy (Electricity Market, Bulk Supply and Open Access) Regulations", year: 2024 },
  ],
  budget: [
    { item: "Solar modules, inverters, mounting", amountUsdM: 26.0, share: 45, basis: "Estimated" as FactBasis, note: "40 MWp at ~$0.65/W equipment, delivered Mombasa." },
    { item: "Battery energy storage system", amountUsdM: 12.6, share: 22, basis: "Estimated" as FactBasis, note: "60 MWh at ~$210/kWh installed, including PCS and containers." },
    { item: "Balance of plant and civil works", amountUsdM: 6.3, share: 11, basis: "Estimated" as FactBasis, note: "Site preparation, roads, drainage, security, 74 ha." },
    { item: "Grid interconnection and wheeling works", amountUsdM: 4.1, share: 7, basis: "Estimated" as FactBasis, note: "132/33 kV bay, protection, metering at eleven offtaker sites." },
    { item: "Development, permits, land and ESIA", amountUsdM: 3.4, share: 6, basis: "Estimated" as FactBasis, note: "NEMA ESIA, EPRA licence, land lease premium, legal." },
    { item: "Owner's engineer, insurance, financing costs", amountUsdM: 2.9, share: 5, basis: "Estimated" as FactBasis, note: "Lender's technical adviser, construction all-risk, commitment fees." },
    { item: "Contingency", amountUsdM: 2.1, share: 4, basis: "Estimated" as FactBasis, note: "3.7% of capex — low because equipment pricing is contracted." },
  ] as BudgetLine[],
  stakeholders: [
    { name: "Kenya Power (KPLC)", role: "Network operator and wheeling counterparty", interest: "Deferred distribution reinforcement; wheeling revenue without capex.", commitment: "Wheeling agreement and interconnection consent", status: "Approached" as const },
    { name: "EPRA", role: "Energy regulator", interest: "Compliance with open-access rules and tariff transparency.", commitment: "Generation and supply licences", status: "Identified" as const },
    { name: "Machakos County Government", role: "Host authority", interest: "Rateable value, local jobs, industrial competitiveness.", commitment: "Land use approval, county levies waiver", status: "Engaged" as const },
    { name: "Eleven industrial offtakers", role: "Power purchasers", interest: "Electricity below the diesel-blended rate they pay today.", commitment: "10-year PPAs at $0.078/kWh", status: "Engaged" as const },
    { name: "Athi River landowners", role: "Land partners", interest: "Long lease income from marginal ranch land.", commitment: "25-year lease over 74 ha", status: "Approached" as const },
    { name: "NEMA", role: "Environmental regulator", interest: "Ecological and social safeguards.", commitment: "ESIA licence", status: "Identified" as const },
    { name: "Mavoko community trust", role: "Community shareholder", interest: "Ownership stake and local hiring.", commitment: "8% community equity tranche", status: "Identified" as const },
    { name: "Local EPC and O&M contractors", role: "Delivery", interest: "Construction and 20-year service contracts.", commitment: "Local content ≥40% of works value", status: "Approached" as const },
  ] as Stakeholder[],
  milestones: [
    { stage: "DIAGNOSE", window: "Months 0–3", gate: "Load study across eleven offtakers, resource verification, grid capacity confirmation." },
    { stage: "DESIGN", window: "Months 3–8", gate: "Bankable design, ESIA submitted, land options signed." },
    { stage: "VALIDATE", window: "Months 8–12", gate: "PPAs executed, wheeling agreement agreed with Kenya Power." },
    { stage: "FINANCE", window: "Months 12–20", gate: "Financial close: equity, DFI debt and climate tranche committed." },
    { stage: "BUILD", window: "Months 20–34", gate: "Mechanical completion, energisation, performance test." },
    { stage: "OPERATE", window: "Month 34 onward", gate: "Availability above 97%, metered delivery to all offtakers." },
    { stage: "MEASURE", window: "Continuous", gate: "Metered generation, avoided diesel litres, verified emissions." },
  ] as Milestone[],
  risks: [
    { risk: "Wheeling tariff changes after financial close", mitigation: "Tariff-change clause in PPAs passing regulated cost through to offtakers." },
    { risk: "Kenyan shilling depreciation against dollar debt", mitigation: "Local-currency tranche from IFC or DFI hedging facility; PPAs indexed." },
    { risk: "Offtaker credit deterioration", mitigation: "Six-month payment security from each offtaker plus a shared liquidity reserve." },
    { risk: "Grid curtailment at midday", mitigation: "60 MWh of storage shifts surplus into the evening peak instead of exporting it." },
    { risk: "Land tenure dispute", mitigation: "Title verification and community trust equity before lease execution." },
  ],
};

export type Flagship = typeof FLAGSHIP;
