// Atlas Sanctum — knowledge base.
// Every value here is an explicit, traceable estimate. Provenance is attached
// so the interface can always distinguish observed / estimated / modeled data.

export type Provenance = {
  source: string;
  year: number;
  method: "Observed" | "Estimated" | "Modeled" | "Forecast";
  confidence: "High" | "Medium" | "Low";
  resolution: string;
};

export type SystemId =
  | "energy"
  | "compute"
  | "water"
  | "land"
  | "mobility"
  | "human"
  | "ecology"
  | "capital";

export type InfraSystem = {
  id: SystemId;
  label: string;
  colorVar: string;
  blurb: string;
  layers: string[];
};

export const SYSTEMS: InfraSystem[] = [
  {
    id: "energy",
    label: "Energy",
    colorVar: "var(--signal-energy)",
    blurb: "Generation, transmission, storage and demand.",
    layers: [
      "generation",
      "transmission",
      "distribution",
      "storage",
      "demand",
      "renewable potential",
      "grid congestion",
    ],
  },
  {
    id: "compute",
    label: "Compute",
    colorVar: "var(--signal-compute)",
    blurb: "Data centres, fibre, connectivity, AI demand.",
    layers: [
      "data centres",
      "cloud regions",
      "fibre",
      "connectivity",
      "AI compute demand",
      "semiconductor dependency",
    ],
  },
  {
    id: "water",
    label: "Water",
    colorVar: "var(--signal-water)",
    blurb: "Rivers, aquifers, treatment, stress and flood risk.",
    layers: [
      "rivers",
      "reservoirs",
      "aquifers",
      "treatment",
      "water stress",
      "wastewater",
      "flood risk",
    ],
  },
  {
    id: "land",
    label: "Land",
    colorVar: "var(--signal-land)",
    blurb: "Agriculture, urbanisation, forests, degradation.",
    layers: [
      "agriculture",
      "urbanisation",
      "forests",
      "degraded land",
      "protected areas",
      "development pressure",
    ],
  },
  {
    id: "mobility",
    label: "Mobility",
    colorVar: "var(--signal-mobility)",
    blurb: "Roads, rail, ports, corridors, public transport.",
    layers: ["roads", "rail", "ports", "airports", "logistics corridors", "public transport"],
  },
  {
    id: "human",
    label: "Human Systems",
    colorVar: "var(--signal-human)",
    blurb: "Population, health, education, housing, work.",
    layers: ["population", "health", "education", "employment", "housing", "economic activity"],
  },
  {
    id: "ecology",
    label: "Ecology",
    colorVar: "var(--signal-ecology)",
    blurb: "Biodiversity, carbon, soil, wetlands, resilience.",
    layers: ["biodiversity", "carbon", "soil", "forests", "wetlands", "ecosystem resilience"],
  },
  {
    id: "capital",
    label: "Capital",
    colorVar: "var(--signal-capital)",
    blurb: "Public, private, development and climate finance.",
    layers: [
      "infrastructure investment",
      "public spending",
      "private investment",
      "development finance",
      "project pipelines",
    ],
  },
];

export const SYSTEM_BY_ID = Object.fromEntries(SYSTEMS.map((s) => [s.id, s])) as Record<
  SystemId,
  InfraSystem
>;

export type Indicators = {
  capacity: number;
  access: number;
  affordability: number;
  reliability: number;
  resilience: number;
  ecologicalIntegrity: number;
  humanBenefit: number;
  innovationCapacity: number;
  capitalReadiness: number;
  futureReadiness: number;
};

export type Place = {
  id: string;
  name: string;
  scope: "Planetary" | "Continental" | "National" | "Regional" | "City";
  parent?: string;
  lat: number;
  lon: number;
  population: number;
  gdpPerCapita: number;
  headline: string;
  constraint: string;
  becomingPossible: string;
  indicators: Indicators;
  systemStatus: Record<SystemId, { capacity: number; demand: number; growth: number; risk: number }>;
  provenance: Provenance;
};

const ind = (v: number[]): Indicators => ({
  capacity: v[0] ?? 0,
  access: v[1] ?? 0,
  affordability: v[2] ?? 0,
  reliability: v[3] ?? 0,
  resilience: v[4] ?? 0,
  ecologicalIntegrity: v[5] ?? 0,
  humanBenefit: v[6] ?? 0,
  innovationCapacity: v[7] ?? 0,
  capitalReadiness: v[8] ?? 0,
  futureReadiness: v[9] ?? 0,
});

const status = (
  rows: Array<[SystemId, number, number, number, number]>,
): Place["systemStatus"] =>
  Object.fromEntries(
    rows.map(([id, capacity, demand, growth, risk]) => [id, { capacity, demand, growth, risk }]),
  ) as Place["systemStatus"];

export const PLACES: Place[] = [
  {
    id: "world",
    name: "Earth",
    scope: "Planetary",
    lat: 5,
    lon: 15,
    population: 8_200_000_000,
    gdpPerCapita: 13400,
    headline: "Global infrastructure is being re-priced by electricity and compute.",
    constraint: "Grid interconnection queues and transformer supply chains.",
    becomingPossible: "Cheap solar + storage makes distributed abundance buildable this decade.",
    indicators: ind([61, 67, 55, 63, 52, 44, 60, 58, 57, 49]),
    systemStatus: status([
      ["energy", 62, 78, 3.4, 58],
      ["compute", 54, 92, 21.0, 61],
      ["water", 57, 74, 2.1, 66],
      ["land", 60, 71, 1.4, 59],
      ["mobility", 64, 70, 2.6, 44],
      ["human", 58, 80, 1.0, 47],
      ["ecology", 41, 88, -1.8, 74],
      ["capital", 55, 83, 6.2, 51],
    ]),
    provenance: {
      source: "Atlas composite (IEA, IRENA, WRI Aqueduct, World Bank, GIH)",
      year: 2025,
      method: "Estimated",
      confidence: "Medium",
      resolution: "Global",
    },
  },
  {
    id: "africa",
    name: "Africa",
    scope: "Continental",
    parent: "world",
    lat: 1,
    lon: 21,
    population: 1_500_000_000,
    gdpPerCapita: 2100,
    headline: "The largest infrastructure build-out of the century has not started yet.",
    constraint: "Capital cost of debt, not physical or technical potential.",
    becomingPossible: "Solar-anchored industrialisation with compute as demand anchor.",
    indicators: ind([34, 42, 38, 40, 36, 58, 45, 41, 33, 47]),
    systemStatus: status([
      ["energy", 31, 74, 6.1, 71],
      ["compute", 22, 68, 27.0, 64],
      ["water", 38, 72, 3.4, 73],
      ["land", 66, 58, 2.2, 55],
      ["mobility", 36, 69, 4.0, 58],
      ["human", 40, 86, 2.4, 52],
      ["ecology", 57, 70, -1.1, 66],
      ["capital", 29, 88, 8.4, 69],
    ]),
    provenance: {
      source: "Atlas composite (AfDB, IEA Africa Energy Outlook, UN DESA)",
      year: 2025,
      method: "Estimated",
      confidence: "Medium",
      resolution: "Continental",
    },
  },
  {
    id: "kenya",
    name: "Kenya",
    scope: "National",
    parent: "africa",
    lat: 0.5,
    lon: 37.9,
    population: 56_000_000,
    gdpPerCapita: 2200,
    headline: "One of the cleanest grids on Earth — and one of the least reliable.",
    constraint: "Transmission and distribution, not generation capacity.",
    becomingPossible: "Geothermal + solar baseload attracting regional compute demand.",
    indicators: ind([48, 76, 41, 52, 49, 61, 57, 60, 52, 58]),
    systemStatus: status([
      ["energy", 55, 71, 5.2, 57],
      ["compute", 38, 74, 24.0, 49],
      ["water", 41, 78, 3.1, 72],
      ["land", 62, 64, 2.0, 58],
      ["mobility", 49, 68, 4.4, 46],
      ["human", 52, 82, 2.1, 44],
      ["ecology", 55, 69, -0.9, 63],
      ["capital", 44, 79, 7.0, 60],
    ]),
    provenance: {
      source: "Atlas composite (EPRA, KenGen, Kenya Power, WRI, KNBS)",
      year: 2025,
      method: "Estimated",
      confidence: "Medium",
      resolution: "National",
    },
  },
  {
    id: "nairobi",
    name: "Nairobi Metropolitan Region",
    scope: "City",
    parent: "kenya",
    lat: -1.29,
    lon: 36.82,
    population: 5_600_000,
    gdpPerCapita: 4100,
    headline: "East Africa's digital anchor, running on a constrained distribution network.",
    constraint: "Distribution reliability, water supply deficit, land pressure.",
    becomingPossible: "Distributed solar + storage + wastewater reuse as a single system.",
    indicators: ind([54, 82, 44, 47, 45, 43, 62, 71, 61, 63]),
    systemStatus: status([
      ["energy", 52, 84, 6.8, 64],
      ["compute", 47, 88, 29.0, 52],
      ["water", 36, 91, 4.2, 79],
      ["land", 44, 83, 5.1, 68],
      ["mobility", 41, 87, 5.6, 61],
      ["human", 57, 85, 3.2, 49],
      ["ecology", 38, 74, -2.2, 71],
      ["capital", 56, 77, 9.1, 48],
    ]),
    provenance: {
      source: "Atlas composite (Nairobi City County, Kenya Power, UN-Habitat)",
      year: 2025,
      method: "Estimated",
      confidence: "Medium",
      resolution: "Metropolitan",
    },
  },
  {
    id: "west-kenya",
    name: "Western Kenya",
    scope: "Regional",
    parent: "kenya",
    lat: 0.28,
    lon: 34.75,
    population: 11_000_000,
    gdpPerCapita: 1300,
    headline: "High rainfall, high soils, low infrastructure conversion.",
    constraint: "Cold chain, grid density and agro-processing capacity.",
    becomingPossible: "Regenerative agriculture linked to microgrids and rail logistics.",
    indicators: ind([33, 58, 47, 38, 42, 66, 49, 38, 36, 45]),
    systemStatus: status([
      ["energy", 34, 62, 5.0, 66],
      ["compute", 18, 51, 19.0, 57],
      ["water", 63, 55, 1.6, 48],
      ["land", 71, 61, 1.8, 52],
      ["mobility", 33, 64, 3.4, 59],
      ["human", 43, 79, 2.3, 55],
      ["ecology", 62, 63, -0.6, 57],
      ["capital", 27, 74, 5.5, 68],
    ]),
    provenance: {
      source: "Atlas composite (KNBS county data, FAO, Kenya Power)",
      year: 2025,
      method: "Estimated",
      confidence: "Low",
      resolution: "Regional",
    },
  },
  {
    id: "east-africa",
    name: "East Africa Power Pool",
    scope: "Regional",
    parent: "africa",
    lat: -1.5,
    lon: 33.5,
    population: 300_000_000,
    gdpPerCapita: 1500,
    headline: "A regional grid forming faster than the market that should use it.",
    constraint: "Cross-border transmission and offtake creditworthiness.",
    becomingPossible: "Ethiopia–Kenya–Tanzania interconnection as an industrial platform.",
    indicators: ind([40, 51, 43, 44, 41, 60, 48, 44, 39, 53]),
    systemStatus: status([
      ["energy", 44, 72, 6.5, 62],
      ["compute", 25, 63, 22.0, 58],
      ["water", 48, 68, 2.7, 64],
      ["land", 64, 60, 2.1, 54],
      ["mobility", 38, 70, 4.2, 57],
      ["human", 44, 83, 2.6, 51],
      ["ecology", 58, 67, -1.0, 62],
      ["capital", 33, 81, 7.6, 63],
    ]),
    provenance: {
      source: "Atlas composite (EAPP, World Bank, IEA)",
      year: 2025,
      method: "Estimated",
      confidence: "Low",
      resolution: "Multi-country",
    },
  },
  {
    id: "lagos",
    name: "Lagos",
    scope: "City",
    parent: "africa",
    lat: 6.52,
    lon: 3.37,
    population: 16_500_000,
    gdpPerCapita: 4300,
    headline: "Megacity growth outrunning grid, water and drainage systems.",
    constraint: "Self-generation dependency and coastal flood exposure.",
    becomingPossible: "Coastal resilience infrastructure as an investable asset class.",
    indicators: ind([42, 71, 36, 33, 31, 34, 55, 63, 54, 48]),
    systemStatus: status([
      ["energy", 38, 92, 7.2, 74],
      ["compute", 44, 84, 26.0, 55],
      ["water", 33, 89, 4.6, 81],
      ["land", 39, 88, 5.8, 72],
      ["mobility", 36, 93, 6.1, 69],
      ["human", 51, 90, 3.6, 57],
      ["ecology", 29, 78, -2.8, 78],
      ["capital", 49, 82, 8.0, 58],
    ]),
    provenance: {
      source: "Atlas composite (NBS Nigeria, UN-Habitat, WRI)",
      year: 2025,
      method: "Estimated",
      confidence: "Low",
      resolution: "Metropolitan",
    },
  },
  {
    id: "india",
    name: "India",
    scope: "National",
    parent: "world",
    lat: 22.5,
    lon: 79,
    population: 1_450_000_000,
    gdpPerCapita: 2700,
    headline: "Fastest absolute build-out of renewables and compute simultaneously.",
    constraint: "Water stress and transmission evacuation in solar belts.",
    becomingPossible: "Round-the-clock renewable industrial parks.",
    indicators: ind([58, 84, 52, 57, 50, 39, 61, 69, 66, 62]),
    systemStatus: status([
      ["energy", 63, 86, 7.4, 55],
      ["compute", 58, 90, 31.0, 47],
      ["water", 42, 88, 3.0, 78],
      ["land", 55, 79, 2.4, 63],
      ["mobility", 61, 78, 5.0, 42],
      ["human", 59, 84, 1.8, 45],
      ["ecology", 37, 82, -1.6, 72],
      ["capital", 64, 76, 8.8, 41],
    ]),
    provenance: {
      source: "Atlas composite (CEA, MNRE, CGWB, World Bank)",
      year: 2025,
      method: "Estimated",
      confidence: "Medium",
      resolution: "National",
    },
  },
  {
    id: "nordics",
    name: "Nordic Grid Region",
    scope: "Regional",
    parent: "world",
    lat: 61,
    lon: 15,
    population: 27_000_000,
    gdpPerCapita: 62000,
    headline: "Clean firm power meeting hyperscale compute demand.",
    constraint: "Local grid connection capacity and social licence.",
    becomingPossible: "Heat recovery from data centres as district infrastructure.",
    indicators: ind([79, 97, 71, 88, 78, 72, 84, 82, 83, 80]),
    systemStatus: status([
      ["energy", 84, 68, 2.1, 27],
      ["compute", 76, 88, 24.0, 34],
      ["water", 88, 41, 0.8, 19],
      ["land", 74, 46, 0.6, 26],
      ["mobility", 79, 58, 1.2, 22],
      ["human", 86, 62, 0.5, 18],
      ["ecology", 71, 52, 0.4, 33],
      ["capital", 81, 64, 3.4, 24],
    ]),
    provenance: {
      source: "Atlas composite (Nord Pool, ENTSO-E, Eurostat)",
      year: 2025,
      method: "Observed",
      confidence: "High",
      resolution: "Regional",
    },
  },
  {
    id: "sao-paulo",
    name: "São Paulo",
    scope: "City",
    parent: "world",
    lat: -23.55,
    lon: -46.63,
    population: 22_600_000,
    gdpPerCapita: 12800,
    headline: "Hydro-dependent grid facing drought and heat volatility.",
    constraint: "Reservoir variability and urban drainage.",
    becomingPossible: "Watershed restoration priced as water-security infrastructure.",
    indicators: ind([61, 89, 49, 62, 46, 41, 63, 66, 62, 55]),
    systemStatus: status([
      ["energy", 66, 79, 3.1, 52],
      ["compute", 52, 78, 23.0, 44],
      ["water", 47, 84, 2.4, 74],
      ["land", 48, 76, 2.0, 61],
      ["mobility", 58, 82, 2.2, 48],
      ["human", 62, 77, 1.1, 43],
      ["ecology", 40, 76, -1.4, 70],
      ["capital", 58, 71, 4.6, 46],
    ]),
    provenance: {
      source: "Atlas composite (ONS, ANA, IBGE)",
      year: 2025,
      method: "Estimated",
      confidence: "Medium",
      resolution: "Metropolitan",
    },
  },
  {
    id: "texas",
    name: "Texas / ERCOT",
    scope: "Regional",
    parent: "world",
    lat: 31.2,
    lon: -99.5,
    population: 31_000_000,
    gdpPerCapita: 78000,
    headline: "The world's fastest-growing large-load interconnection queue.",
    constraint: "Firming capacity, water for cooling, extreme weather.",
    becomingPossible: "Load flexibility as a tradable infrastructure asset.",
    indicators: ind([74, 96, 66, 63, 54, 43, 72, 86, 88, 71]),
    systemStatus: status([
      ["energy", 78, 91, 6.4, 58],
      ["compute", 71, 96, 34.0, 44],
      ["water", 51, 79, 2.0, 69],
      ["land", 77, 62, 1.5, 38],
      ["mobility", 68, 66, 1.8, 31],
      ["human", 73, 71, 1.6, 34],
      ["ecology", 44, 71, -1.2, 63],
      ["capital", 84, 69, 9.4, 27],
    ]),
    provenance: {
      source: "Atlas composite (ERCOT, EIA, USGS)",
      year: 2025,
      method: "Observed",
      confidence: "High",
      resolution: "Grid region",
    },
  },
];

export const PLACE_BY_ID = Object.fromEntries(PLACES.map((p) => [p.id, p])) as Record<string, Place>;

export type Asset = {
  id: string;
  name: string;
  type: string;
  system: SystemId;
  placeId: string;
  lat: number;
  lon: number;
  scale: string;
  dependencies: Array<{ label: string; system: SystemId; criticality: number; note: string }>;
};

export const ASSETS: Asset[] = [
  {
    id: "asset-dc-nairobi",
    name: "Nairobi AI Data Centre Cluster",
    type: "AI Data Centre",
    system: "compute",
    placeId: "nairobi",
    lat: -1.32,
    lon: 36.89,
    scale: "48 MW IT load (planned 120 MW)",
    dependencies: [
      { label: "Electricity supply", system: "energy", criticality: 98, note: "Firm 24/7 load; grid outage tolerance under 30s." },
      { label: "Transmission", system: "energy", criticality: 91, note: "Two 132 kV feeds required for N-1 redundancy." },
      { label: "Renewable generation", system: "energy", criticality: 76, note: "Geothermal PPA + on-site solar." },
      { label: "Water & cooling", system: "water", criticality: 84, note: "1.4 M litres/day if evaporative; near-zero if closed-loop." },
      { label: "Fibre routes", system: "compute", criticality: 88, note: "Diverse paths to subsea landing at Mombasa." },
      { label: "Land & zoning", system: "land", criticality: 61, note: "18 ha industrial-zoned, low flood exposure." },
      { label: "Workforce", system: "human", criticality: 58, note: "~320 operations and engineering roles." },
      { label: "Transport access", system: "mobility", criticality: 44, note: "Heavy equipment corridor access." },
      { label: "Capital", system: "capital", criticality: 82, note: "$610M capex; 12-year offtake needed." },
      { label: "Local community", system: "human", criticality: 66, note: "Noise, water and tariff externalities." },
      { label: "Ecological systems", system: "ecology", criticality: 52, note: "Aquifer drawdown and heat rejection." },
    ],
  },
  {
    id: "asset-olkaria",
    name: "Olkaria Geothermal Complex",
    type: "Geothermal Generation",
    system: "energy",
    placeId: "kenya",
    lat: -0.9,
    lon: 36.3,
    scale: "~800 MW installed",
    dependencies: [
      { label: "Steam field", system: "ecology", criticality: 95, note: "Reservoir pressure decline risk." },
      { label: "Transmission", system: "energy", criticality: 90, note: "Evacuation to Nairobi and Suswa." },
      { label: "Water reinjection", system: "water", criticality: 78, note: "Sustains reservoir over decades." },
      { label: "Offtake", system: "capital", criticality: 85, note: "Single-buyer credit exposure." },
      { label: "Community land", system: "human", criticality: 63, note: "Pastoralist land use agreements." },
    ],
  },
  {
    id: "asset-ruiru",
    name: "Ruiru Wastewater Reuse Plant",
    type: "Water Treatment",
    system: "water",
    placeId: "nairobi",
    lat: -1.15,
    lon: 36.96,
    scale: "80,000 m³/day (proposed)",
    dependencies: [
      { label: "Sewer network", system: "water", criticality: 92, note: "Collection coverage is the binding constraint." },
      { label: "Electricity", system: "energy", criticality: 74, note: "0.45 kWh per m³ treated." },
      { label: "Land", system: "land", criticality: 55, note: "Buffer zone and biosolids handling." },
      { label: "Agricultural offtake", system: "land", criticality: 69, note: "Reuse demand from peri-urban farms." },
      { label: "Tariff & finance", system: "capital", criticality: 80, note: "Affordability-constrained revenue." },
    ],
  },
  {
    id: "asset-sgr",
    name: "Standard Gauge Rail Corridor",
    type: "Rail Logistics",
    system: "mobility",
    placeId: "kenya",
    lat: -2.5,
    lon: 38.5,
    scale: "578 km Mombasa–Nairobi",
    dependencies: [
      { label: "Port throughput", system: "mobility", criticality: 89, note: "Mombasa dwell times set utilisation." },
      { label: "Energy", system: "energy", criticality: 58, note: "Diesel traction; electrification optional." },
      { label: "Freight demand", system: "capital", criticality: 84, note: "Debt service depends on volume." },
      { label: "Land corridor", system: "land", criticality: 62, note: "Wildlife crossings and settlements." },
      { label: "Ecosystems", system: "ecology", criticality: 57, note: "Tsavo migration continuity." },
    ],
  },
  {
    id: "asset-lake-vic",
    name: "Lake Victoria Basin Wetlands",
    type: "Ecosystem Asset",
    system: "ecology",
    placeId: "west-kenya",
    lat: -0.35,
    lon: 34.2,
    scale: "~4,100 km² wetland complex",
    dependencies: [
      { label: "Upstream land use", system: "land", criticality: 88, note: "Sediment and nutrient loading." },
      { label: "Water abstraction", system: "water", criticality: 81, note: "Irrigation and urban withdrawal." },
      { label: "Fisheries livelihoods", system: "human", criticality: 76, note: "~200,000 direct livelihoods." },
      { label: "Restoration finance", system: "capital", criticality: 64, note: "Carbon and biodiversity markets." },
    ],
  },
];

export type Opportunity = {
  id: string;
  code: string;
  title: string;
  placeId: string;
  systems: SystemId[];
  problem: string;
  opportunity: string;
  capitalUsdM: number;
  beneficiaries: number;
  resilienceGainPct: number;
  emissionsTco2e: number;
  regenerativePotential: "High" | "Very High" | "Moderate";
  whyNow: string;
  whatCouldChange: string;
  whoParticipates: string[];
  whatCouldPrevent: string[];
  capitals: Record<CapitalId, number>;
  confidence: "High" | "Medium" | "Low";
};

export type CapitalId =
  | "financial"
  | "human"
  | "social"
  | "natural"
  | "knowledge"
  | "technological"
  | "cultural";

export const SEVEN_CAPITALS: Array<{ id: CapitalId; label: string; blurb: string }> = [
  { id: "financial", label: "Financial", blurb: "Economic return and capital requirements." },
  { id: "human", label: "Human", blurb: "Health, skills, livelihoods, capability." },
  { id: "social", label: "Social", blurb: "Trust, participation, cohesion." },
  { id: "natural", label: "Natural", blurb: "Biodiversity, water, soil, carbon." },
  { id: "knowledge", label: "Knowledge", blurb: "Research, education, data, learning." },
  { id: "technological", label: "Technological", blurb: "Compute, connectivity, innovation." },
  { id: "cultural", label: "Cultural", blurb: "Identity, heritage, meaning, local knowledge." },
];

export const OPPORTUNITIES: Opportunity[] = [
  {
    id: "opp-001",
    code: "OPPORTUNITY #001",
    title: "Distributed Solar + Storage Network",
    placeId: "nairobi",
    systems: ["energy", "capital", "human"],
    problem: "Grid reliability failures and rising electricity demand force costly diesel backup across commercial and industrial nodes.",
    opportunity:
      "Deploy 180 MW of distributed generation and 240 MWh of storage across strategic commercial, industrial and community nodes, dispatchable to the distribution network.",
    capitalUsdM: 310,
    beneficiaries: 1_850_000,
    resilienceGainPct: 34,
    emissionsTco2e: 410_000,
    regenerativePotential: "High",
    whyNow: "Solar and storage costs have fallen below the diesel backup that 60% of large consumers already pay for.",
    whatCouldChange: "Outage cost per firm falls sharply; the distribution utility gains flexible capacity without new generation.",
    whoParticipates: ["Distribution utility", "Industrial offtakers", "County government", "Local EPCs", "DFIs", "Community energy cooperatives"],
    whatCouldPrevent: ["Tariff and wheeling rules", "FX risk on imported equipment", "Interconnection approval time", "Land tenure at community nodes"],
    capitals: { financial: 74, human: 62, social: 58, natural: 66, knowledge: 55, technological: 78, cultural: 40 },
    confidence: "Medium",
  },
  {
    id: "opp-002",
    code: "OPPORTUNITY #002",
    title: "Wastewater Reuse for Peri-Urban Agriculture",
    placeId: "nairobi",
    systems: ["water", "land", "ecology"],
    problem: "Nairobi discharges most treated and untreated wastewater downstream while peri-urban agriculture is water-constrained.",
    opportunity:
      "Build 80,000 m³/day tertiary reuse capacity linked to irrigation offtake and river base-flow restoration.",
    capitalUsdM: 240,
    beneficiaries: 940_000,
    resilienceGainPct: 27,
    emissionsTco2e: 85_000,
    regenerativePotential: "Very High",
    whyNow: "Water deficit is now the binding constraint on both housing approval and food prices.",
    whatCouldChange: "River quality improves measurably; irrigated area expands without new abstraction.",
    whoParticipates: ["Water utility", "Farmer cooperatives", "WRA regulator", "Climate funds", "Technology providers"],
    whatCouldPrevent: ["Sewer coverage gaps", "Reuse safety perception", "Tariff affordability", "Land conversion pressure"],
    capitals: { financial: 58, human: 71, social: 66, natural: 86, knowledge: 61, technological: 60, cultural: 52 },
    confidence: "Medium",
  },
  {
    id: "opp-003",
    code: "OPPORTUNITY #003",
    title: "Compute Anchored to Geothermal Baseload",
    placeId: "kenya",
    systems: ["compute", "energy", "capital"],
    problem: "Firm clean generation is curtailed at night while regional AI workloads run on distant, higher-carbon capacity.",
    opportunity:
      "Site 120 MW of AI compute adjacent to geothermal generation with closed-loop cooling and heat reuse for agro-processing.",
    capitalUsdM: 1450,
    beneficiaries: 320_000,
    resilienceGainPct: 18,
    emissionsTco2e: 620_000,
    regenerativePotential: "High",
    whyNow: "Global compute siting is being decided now on the basis of firm clean power availability.",
    whatCouldChange: "Kenya becomes a regional compute exporter rather than a bandwidth consumer.",
    whoParticipates: ["Generator", "Hyperscalers", "Regulator", "Export credit agencies", "Local universities"],
    whatCouldPrevent: ["Transmission timing", "Sovereign data policy", "Steam field decline", "Skills pipeline"],
    capitals: { financial: 82, human: 54, social: 44, natural: 57, knowledge: 79, technological: 92, cultural: 36 },
    confidence: "Low",
  },
  {
    id: "opp-004",
    code: "OPPORTUNITY #004",
    title: "Cold Chain + Microgrid Corridor",
    placeId: "west-kenya",
    systems: ["energy", "land", "mobility"],
    problem: "Post-harvest losses exceed 30% because refrigeration requires reliable power the region does not have.",
    opportunity:
      "Deploy 42 solar microgrids paired with cold rooms and aggregation points along the rail and trunk-road corridor.",
    capitalUsdM: 96,
    beneficiaries: 2_100_000,
    resilienceGainPct: 31,
    emissionsTco2e: 140_000,
    regenerativePotential: "Very High",
    whyNow: "Cold room capex has halved and mobile payment rails make pay-per-use viable.",
    whatCouldChange: "Farmgate income rises; urban food price volatility falls.",
    whoParticipates: ["Farmer cooperatives", "Microgrid developers", "County governments", "Blended finance funds"],
    whatCouldPrevent: ["Aggregation logistics", "Offtake contract enforcement", "Road condition", "Maintenance capability"],
    capitals: { financial: 63, human: 84, social: 77, natural: 62, knowledge: 58, technological: 66, cultural: 61 },
    confidence: "Medium",
  },
  {
    id: "opp-005",
    code: "OPPORTUNITY #005",
    title: "Coastal Flood Defence as Investable Asset",
    placeId: "lagos",
    systems: ["water", "ecology", "capital"],
    problem: "Repeated flooding destroys more value each year than the cost of the drainage and mangrove systems that would prevent it.",
    opportunity:
      "Combine engineered drainage upgrades with 6,500 ha of mangrove restoration financed by avoided-loss and resilience bonds.",
    capitalUsdM: 780,
    beneficiaries: 4_300_000,
    resilienceGainPct: 41,
    emissionsTco2e: 300_000,
    regenerativePotential: "Very High",
    whyNow: "Insurance withdrawal is making the cost of inaction explicit and financeable.",
    whatCouldChange: "Flood-exposed districts regain insurability and land value stability.",
    whoParticipates: ["State government", "Insurers", "Coastal communities", "Climate funds", "Engineering firms"],
    whatCouldPrevent: ["Informal settlement displacement risk", "Maintenance funding", "Sand mining", "Governance fragmentation"],
    capitals: { financial: 49, human: 78, social: 72, natural: 91, knowledge: 57, technological: 48, cultural: 66 },
    confidence: "Low",
  },
  {
    id: "opp-006",
    code: "OPPORTUNITY #006",
    title: "Flexible Load Market for Large Compute",
    placeId: "texas",
    systems: ["compute", "energy", "capital"],
    problem: "Interconnection queues are saturated while much of the new load could be curtailable for a few hundred hours a year.",
    opportunity:
      "Create a flexibility contract class letting compute loads connect faster in exchange for firm curtailment obligations.",
    capitalUsdM: 210,
    beneficiaries: 6_800_000,
    resilienceGainPct: 22,
    emissionsTco2e: 950_000,
    regenerativePotential: "Moderate",
    whyNow: "Queue delays now exceed the useful life of a GPU generation.",
    whatCouldChange: "Effective grid capacity increases without new steel in the ground.",
    whoParticipates: ["Grid operator", "Hyperscalers", "Regulator", "Retail consumers"],
    whatCouldPrevent: ["Contract enforceability", "Reliability perception", "Legacy tariff design"],
    capitals: { financial: 88, human: 51, social: 47, natural: 59, knowledge: 72, technological: 90, cultural: 30 },
    confidence: "Medium",
  },
];

export type DesignComponent = {
  id: string;
  label: string;
  system: SystemId;
  unit: string;
  capexPerUnitUsdM: number;
  electricityMw: number;
  waterM3d: number;
  landHa: number;
  jobs: number;
  co2Tpa: number; // negative = sequestration/avoided
  capitals: Record<CapitalId, number>;
};

export const DESIGN_COMPONENTS: DesignComponent[] = [
  { id: "solar", label: "Solar PV", system: "energy", unit: "10 MW", capexPerUnitUsdM: 8, electricityMw: -10, waterM3d: 20, landHa: 18, jobs: 24, co2Tpa: -9000, capitals: { financial: 68, human: 45, social: 40, natural: 62, knowledge: 40, technological: 66, cultural: 25 } },
  { id: "wind", label: "Wind", system: "energy", unit: "20 MW", capexPerUnitUsdM: 26, electricityMw: -20, waterM3d: 5, landHa: 40, jobs: 30, co2Tpa: -18000, capitals: { financial: 62, human: 44, social: 38, natural: 58, knowledge: 44, technological: 70, cultural: 22 } },
  { id: "battery", label: "Battery Storage", system: "energy", unit: "20 MWh", capexPerUnitUsdM: 6, electricityMw: 0.4, waterM3d: 2, landHa: 1, jobs: 8, co2Tpa: -2500, capitals: { financial: 66, human: 36, social: 34, natural: 44, knowledge: 42, technological: 82, cultural: 18 } },
  { id: "microgrid", label: "Microgrid", system: "energy", unit: "1 site", capexPerUnitUsdM: 1.8, electricityMw: -1.2, waterM3d: 3, landHa: 2, jobs: 12, co2Tpa: -1400, capitals: { financial: 55, human: 74, social: 80, natural: 56, knowledge: 50, technological: 58, cultural: 60 } },
  { id: "datacenter", label: "Data Centre", system: "compute", unit: "20 MW IT", capexPerUnitUsdM: 240, electricityMw: 24, waterM3d: 900, landHa: 8, jobs: 130, co2Tpa: 6000, capitals: { financial: 84, human: 52, social: 38, natural: 26, knowledge: 76, technological: 95, cultural: 20 } },
  { id: "fiber", label: "Fibre Network", system: "compute", unit: "100 km", capexPerUnitUsdM: 3.2, electricityMw: 0.2, waterM3d: 0, landHa: 3, jobs: 20, co2Tpa: 400, capitals: { financial: 60, human: 66, social: 62, natural: 48, knowledge: 84, technological: 88, cultural: 44 } },
  { id: "water-treatment", label: "Water Treatment", system: "water", unit: "20,000 m³/d", capexPerUnitUsdM: 34, electricityMw: 0.9, waterM3d: -18000, landHa: 6, jobs: 45, co2Tpa: 1200, capitals: { financial: 52, human: 82, social: 70, natural: 80, knowledge: 55, technological: 62, cultural: 40 } },
  { id: "rail", label: "Rail", system: "mobility", unit: "50 km", capexPerUnitUsdM: 210, electricityMw: 4, waterM3d: 60, landHa: 120, jobs: 260, co2Tpa: -22000, capitals: { financial: 46, human: 72, social: 66, natural: 44, knowledge: 48, technological: 60, cultural: 52 } },
  { id: "housing", label: "Housing", system: "human", unit: "1,000 units", capexPerUnitUsdM: 28, electricityMw: 2.4, waterM3d: 900, landHa: 9, jobs: 340, co2Tpa: 3400, capitals: { financial: 54, human: 88, social: 78, natural: 34, knowledge: 40, technological: 44, cultural: 68 } },
  { id: "agriculture", label: "Regenerative Agriculture", system: "land", unit: "1,000 ha", capexPerUnitUsdM: 4.5, electricityMw: 0.3, waterM3d: 2500, landHa: 1000, jobs: 420, co2Tpa: -5200, capitals: { financial: 44, human: 86, social: 82, natural: 90, knowledge: 62, technological: 40, cultural: 84 } },
  { id: "forest", label: "Forest Restoration", system: "ecology", unit: "1,000 ha", capexPerUnitUsdM: 2.6, electricityMw: 0, waterM3d: -400, landHa: 1000, jobs: 180, co2Tpa: -7800, capitals: { financial: 36, human: 68, social: 74, natural: 97, knowledge: 58, technological: 26, cultural: 80 } },
  { id: "wetland", label: "Wetland Restoration", system: "ecology", unit: "500 ha", capexPerUnitUsdM: 3.1, electricityMw: 0, waterM3d: -1200, landHa: 500, jobs: 120, co2Tpa: -4100, capitals: { financial: 34, human: 66, social: 72, natural: 96, knowledge: 60, technological: 24, cultural: 78 } },
  { id: "hospital", label: "Hospital", system: "human", unit: "200 beds", capexPerUnitUsdM: 62, electricityMw: 1.8, waterM3d: 400, landHa: 4, jobs: 640, co2Tpa: 2600, capitals: { financial: 38, human: 96, social: 84, natural: 30, knowledge: 74, technological: 66, cultural: 58 } },
  { id: "school", label: "School", system: "human", unit: "1,500 places", capexPerUnitUsdM: 9, electricityMw: 0.4, waterM3d: 120, landHa: 3, jobs: 110, co2Tpa: 600, capitals: { financial: 32, human: 94, social: 88, natural: 36, knowledge: 96, technological: 52, cultural: 82 } },
  { id: "coldchain", label: "Cold Chain", system: "mobility", unit: "10 nodes", capexPerUnitUsdM: 7.5, electricityMw: 1.1, waterM3d: 40, landHa: 2, jobs: 95, co2Tpa: -3200, capitals: { financial: 58, human: 80, social: 68, natural: 58, knowledge: 46, technological: 60, cultural: 54 } },
  { id: "recycling", label: "Recycling", system: "land", unit: "1 facility", capexPerUnitUsdM: 18, electricityMw: 1.4, waterM3d: 250, landHa: 5, jobs: 160, co2Tpa: -4600, capitals: { financial: 48, human: 72, social: 66, natural: 78, knowledge: 50, technological: 58, cultural: 46 } },
  { id: "manufacturing", label: "Manufacturing", system: "capital", unit: "1 park", capexPerUnitUsdM: 120, electricityMw: 18, waterM3d: 1800, landHa: 45, jobs: 1400, co2Tpa: 9500, capitals: { financial: 78, human: 84, social: 62, natural: 28, knowledge: 66, technological: 76, cultural: 44 } },
];

export type CapitalSource = {
  id: string;
  label: string;
  costOfCapital: number; // %
  patience: number; // 0-100, tolerance for long horizons
  riskAppetite: number; // 0-100
  note: string;
};

export const CAPITAL_SOURCES: CapitalSource[] = [
  { id: "government", label: "Government", costOfCapital: 4.5, patience: 78, riskAppetite: 55, note: "Enables land, permitting and counter-guarantees." },
  { id: "dfi", label: "Development Finance", costOfCapital: 6.0, patience: 88, riskAppetite: 72, note: "Long tenor, catalytic, slow to close." },
  { id: "private", label: "Private Infrastructure Funds", costOfCapital: 13.5, patience: 42, riskAppetite: 38, note: "Needs contracted, creditworthy revenue." },
  { id: "climate", label: "Climate Finance", costOfCapital: 3.0, patience: 82, riskAppetite: 66, note: "Requires measurable mitigation or adaptation." },
  { id: "philanthropic", label: "Philanthropic", costOfCapital: 0.5, patience: 95, riskAppetite: 92, note: "Best used as first-loss and design capital." },
  { id: "institutional", label: "Institutional Investors", costOfCapital: 9.5, patience: 66, riskAppetite: 30, note: "Enters after operational track record." },
  { id: "community", label: "Community Capital", costOfCapital: 5.5, patience: 74, riskAppetite: 58, note: "Builds social licence and local ownership." },
  { id: "outcome", label: "Outcome-Based Finance", costOfCapital: 7.5, patience: 70, riskAppetite: 74, note: "Pays on verified impact, needs strong MRV." },
];

export const LIFECYCLE = [
  "DISCOVER",
  "DIAGNOSE",
  "DESIGN",
  "VALIDATE",
  "FINANCE",
  "BUILD",
  "OPERATE",
  "MEASURE",
  "REGENERATE",
  "SCALE",
] as const;

export type Project = {
  id: string;
  name: string;
  placeId: string;
  stage: (typeof LIFECYCLE)[number];
  capitalUsdM: number;
  systems: SystemId[];
  thesis: string;
  beneficiaries: number;
  rici: number;
};

export const PROJECTS: Project[] = [
  { id: "prj-01", name: "Nairobi Distributed Energy Network", placeId: "nairobi", stage: "FINANCE", capitalUsdM: 310, systems: ["energy", "capital"], thesis: "Turn backup diesel spend into distributed clean firm capacity owned partly by its users.", beneficiaries: 1_850_000, rici: 58 },
  { id: "prj-02", name: "Ruiru Reuse & River Restoration", placeId: "nairobi", stage: "DESIGN", capitalUsdM: 240, systems: ["water", "ecology"], thesis: "Treat wastewater as the cheapest new water source in the basin.", beneficiaries: 940_000, rici: 61 },
  { id: "prj-03", name: "Western Kenya Cold Chain Corridor", placeId: "west-kenya", stage: "VALIDATE", capitalUsdM: 96, systems: ["energy", "mobility", "land"], thesis: "Refrigeration is agricultural income infrastructure.", beneficiaries: 2_100_000, rici: 54 },
  { id: "prj-04", name: "Geothermal Compute Campus", placeId: "kenya", stage: "DIAGNOSE", capitalUsdM: 1450, systems: ["compute", "energy"], thesis: "Export compute, not raw electricity or raw talent.", beneficiaries: 320_000, rici: 49 },
  { id: "prj-05", name: "Lagos Coastal Resilience Program", placeId: "lagos", stage: "DISCOVER", capitalUsdM: 780, systems: ["water", "ecology"], thesis: "Avoided loss is a revenue line if it is measured properly.", beneficiaries: 4_300_000, rici: 44 },
  { id: "prj-06", name: "Lake Victoria Wetland Regeneration", placeId: "west-kenya", stage: "OPERATE", capitalUsdM: 58, systems: ["ecology", "water"], thesis: "Wetlands are water treatment plants that pay for themselves in fisheries.", beneficiaries: 620_000, rici: 66 },
];

export type GraphNode = {
  id: string;
  label: string;
  kind: "Problem" | "Place" | "Asset" | "Technology" | "Organization" | "Community" | "Capital" | "Project" | "Outcome" | "Ecosystem";
  x: number;
  y: number;
};

export const GRAPH_NODES: GraphNode[] = [
  { id: "g-water-scarcity", label: "Water scarcity", kind: "Problem", x: 8, y: 30 },
  { id: "g-nairobi", label: "Nairobi", kind: "Place", x: 22, y: 52 },
  { id: "g-reuse", label: "Wastewater reuse", kind: "Technology", x: 36, y: 26 },
  { id: "g-treatment", label: "Treatment infrastructure", kind: "Asset", x: 50, y: 46 },
  { id: "g-provider", label: "Technology provider", kind: "Organization", x: 62, y: 20 },
  { id: "g-dfi", label: "DFI financing", kind: "Capital", x: 62, y: 72 },
  { id: "g-agri", label: "Agriculture", kind: "Ecosystem", x: 76, y: 42 },
  { id: "g-food", label: "Food security", kind: "Outcome", x: 88, y: 62 },
  { id: "g-community", label: "Peri-urban communities", kind: "Community", x: 36, y: 78 },
  { id: "g-value", label: "Regenerative economic value", kind: "Outcome", x: 92, y: 26 },
  { id: "g-energy", label: "Grid reliability", kind: "Problem", x: 12, y: 74 },
  { id: "g-project", label: "Ruiru Reuse Project", kind: "Project", x: 50, y: 88 },
];

export const GRAPH_EDGES: Array<{ from: string; to: string; rel: string }> = [
  { from: "g-water-scarcity", to: "g-nairobi", rel: "THREATENS" },
  { from: "g-nairobi", to: "g-reuse", rel: "ENABLES" },
  { from: "g-reuse", to: "g-treatment", rel: "REQUIRES" },
  { from: "g-treatment", to: "g-provider", rel: "DEPENDS_ON" },
  { from: "g-treatment", to: "g-dfi", rel: "FUNDS" },
  { from: "g-treatment", to: "g-agri", rel: "SERVES" },
  { from: "g-agri", to: "g-food", rel: "GENERATES" },
  { from: "g-food", to: "g-value", rel: "GENERATES" },
  { from: "g-community", to: "g-treatment", rel: "BENEFITS" },
  { from: "g-energy", to: "g-treatment", rel: "CONSTRAINS" },
  { from: "g-treatment", to: "g-project", rel: "IMPACTS" },
  { from: "g-project", to: "g-value", rel: "RESTORES" },
];

export const RADAR_FRONTIERS = [
  { label: "AI compute demand", delta: 31.4, unit: "% YoY", state: "Forecast" },
  { label: "Grid interconnection backlog", delta: 18.2, unit: "% YoY", state: "Observed" },
  { label: "Utility-scale storage deployment", delta: 52.7, unit: "% YoY", state: "Observed" },
  { label: "Population under high water stress", delta: 4.1, unit: "% YoY", state: "Modeled" },
  { label: "Transformer lead times", delta: 12.9, unit: "% YoY", state: "Observed" },
  { label: "Blended finance closings", delta: -6.3, unit: "% YoY", state: "Observed" },
  { label: "Cost of capital, emerging markets", delta: 2.4, unit: "pp", state: "Observed" },
  { label: "Restoration finance commitments", delta: 9.8, unit: "% YoY", state: "Estimated" },
];

export const SEARCH_SUGGESTIONS = [
  "Nairobi",
  "Kenya",
  "East Africa Power Grid",
  "Data Centers",
  "Water Security",
  "Urban Mobility",
  "Renewable Energy",
  "Food Systems",
  "Climate Resilience",
];
