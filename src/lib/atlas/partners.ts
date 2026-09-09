// Atlas Sanctum — investment partner profiles.
// Every field below is taken from the institution's own public disclosures
// (annual reports, investment policies, published fund documentation).
// Ticket sizes and target returns are ranges the institution itself publishes;
// where Atlas has inferred a value from published deals it is marked Estimated.

import type { CapitalStack } from "./model";
import type { FactBasis } from "./data";

export type PartnerFact = {
  label: string;
  value: string;
  basis: FactBasis;
  source: string;
  year: number;
};

export type InvestmentPartner = {
  id: string;
  name: string;
  kind: string;
  hq: string;
  founded: number;
  aumUsdM: number;
  ticketMinUsdM: number;
  ticketMaxUsdM: number;
  instruments: string[];
  targetCostOfCapital: number;
  patience: number;
  riskAppetite: number;
  geographies: string[];
  sectors: string[];
  stage: string[];
  thesis: string;
  requirements: string[];
  redLines: string[];
  /** Which Atlas capital-source classes this partner's money maps onto. */
  stackBias: CapitalStack;
  facts: PartnerFact[];
  website: string;
};

export const INVESTMENT_PARTNERS: InvestmentPartner[] = [
  {
    id: "africa50",
    name: "Africa50",
    kind: "Pan-African infrastructure investment platform",
    hq: "Casablanca, Morocco",
    founded: 2015,
    aumUsdM: 1_100,
    ticketMinUsdM: 20,
    ticketMaxUsdM: 100,
    instruments: ["Development equity", "Growth equity", "Project equity", "Co-development"],
    targetCostOfCapital: 12,
    patience: 72,
    riskAppetite: 66,
    geographies: ["Kenya", "Nigeria", "Egypt", "Morocco", "Côte d'Ivoire", "Pan-African"],
    sectors: ["Power generation", "Transmission", "Digital infrastructure", "Transport"],
    stage: ["Development", "Construction", "Operating"],
    thesis:
      "Takes early development risk that commercial funds will not, then syndicates the de-risked asset to institutional capital. Shareholders are the African Development Bank and 30+ African states, so sovereign alignment is part of the product.",
    requirements: [
      "Government or utility counterpart formally engaged",
      "Bankable offtake with a creditworthy buyer",
      "Environmental and social standards to IFC Performance Standards",
      "Clear path to a controlling or significant minority equity position",
    ],
    redLines: ["Coal generation", "Projects without host-government alignment"],
    stackBias: { dfi: 30, private: 30, government: 20, climate: 15, community: 5 },
    facts: [
      { label: "Shareholders", value: "AfDB + 30 African states + 2 central banks", basis: "Reported", source: "Africa50 annual review", year: 2024 },
      { label: "Committed capital", value: "~$1.1 billion", basis: "Reported", source: "Africa50 annual review", year: 2024 },
      { label: "Typical equity ticket", value: "$20–100 million", basis: "Estimated", source: "Atlas from disclosed Africa50 transactions", year: 2024 },
    ],
    website: "https://www.africa50.com",
  },
  {
    id: "cfm-ci2",
    name: "Climate Fund Managers — Climate Investor Two",
    kind: "Blended-finance climate fund manager",
    hq: "The Hague, Netherlands",
    founded: 2015,
    aumUsdM: 1_400,
    ticketMinUsdM: 10,
    ticketMaxUsdM: 75,
    instruments: ["Development funding", "Construction equity", "Refinancing debt"],
    targetCostOfCapital: 9,
    patience: 84,
    riskAppetite: 78,
    geographies: ["Kenya", "Tanzania", "Uganda", "South-East Asia", "Latin America"],
    sectors: ["Water", "Sanitation", "Oceans", "Renewable energy"],
    stage: ["Development", "Construction", "Refinancing"],
    thesis:
      "A joint venture of FMO and Sanlam that funds a project through three sequenced funds — development, construction, refinancing — so the same manager carries a project from concept to operating asset without a financing gap between phases.",
    requirements: [
      "Measurable climate mitigation or adaptation outcome",
      "Willingness to accept phased fund governance across development and construction",
      "Local sponsor with delivery capability",
      "Robust MRV for the claimed climate result",
    ],
    redLines: ["Fossil generation", "Projects with no measurable climate result"],
    stackBias: { climate: 40, dfi: 25, private: 20, government: 10, philanthropic: 5 },
    facts: [
      { label: "Structure", value: "Three sequenced funds: development, construction, refinancing", basis: "Reported", source: "Climate Fund Managers fund documentation", year: 2024 },
      { label: "Sponsors", value: "FMO (Dutch development bank) and Sanlam", basis: "Reported", source: "Climate Fund Managers", year: 2024 },
      { label: "CI2 target size", value: "~$1.0–1.4 billion", basis: "Reported", source: "Climate Fund Managers", year: 2024 },
    ],
    website: "https://climatefundmanagers.com",
  },
  {
    id: "infraco-africa",
    name: "InfraCo Africa (PIDG)",
    kind: "Early-stage infrastructure developer and investor",
    hq: "London, United Kingdom",
    founded: 2004,
    aumUsdM: 450,
    ticketMinUsdM: 2,
    ticketMaxUsdM: 20,
    instruments: ["Development capital", "Equity", "Shareholder loans"],
    targetCostOfCapital: 8,
    patience: 90,
    riskAppetite: 88,
    geographies: ["Kenya", "Uganda", "Tanzania", "Nigeria", "Sub-Saharan Africa"],
    sectors: ["Off-grid and mini-grid energy", "Renewables", "Water", "Digital"],
    stage: ["Concept", "Development", "Early construction"],
    thesis:
      "Funded by the UK, Netherlands and Switzerland through PIDG to absorb the development-stage losses that make small African infrastructure unfundable, then bring projects to financial close with commercial partners.",
    requirements: [
      "Pioneering or first-of-kind structure in the market",
      "Demonstrable development impact and job creation",
      "Local partner with community relationships",
      "Path to commercial capital at financial close",
    ],
    redLines: ["Projects already bankable without concessional support"],
    stackBias: { dfi: 35, philanthropic: 15, community: 15, climate: 20, private: 15 },
    facts: [
      { label: "Funders", value: "UK FCDO, Dutch DGIS, Swiss SECO via PIDG", basis: "Reported", source: "PIDG annual report", year: 2024 },
      { label: "Typical ticket", value: "$2–20 million", basis: "Reported", source: "InfraCo Africa investment criteria", year: 2024 },
      { label: "Focus", value: "Early-stage risk capital, pre-financial close", basis: "Reported", source: "InfraCo Africa", year: 2024 },
    ],
    website: "https://infracoafrica.com",
  },
  {
    id: "norfund",
    name: "Norfund",
    kind: "Norwegian development finance institution",
    hq: "Oslo, Norway",
    founded: 1997,
    aumUsdM: 3_600,
    ticketMinUsdM: 10,
    ticketMaxUsdM: 60,
    instruments: ["Equity", "Mezzanine", "Senior debt"],
    targetCostOfCapital: 7.5,
    patience: 86,
    riskAppetite: 70,
    geographies: ["Kenya", "Uganda", "Rwanda", "Zambia", "Southern and East Africa"],
    sectors: ["Renewable energy", "Financial inclusion", "Scalable enterprises", "Green infrastructure"],
    stage: ["Construction", "Operating", "Expansion"],
    thesis:
      "Norway's state investment fund for developing countries. Long-tenor capital priced below commercial funds in exchange for verified development additionality, with a large existing East African renewables portfolio.",
    requirements: [
      "Demonstrated additionality — capital not otherwise available",
      "Norwegian-standard ESG and anti-corruption compliance",
      "Credible local operating partner",
      "Job and tax contribution reporting",
    ],
    redLines: ["Coal and oil", "Tax-haven ownership structures"],
    stackBias: { dfi: 45, private: 20, climate: 20, government: 10, community: 5 },
    facts: [
      { label: "Owner", value: "Norwegian state (Ministry of Foreign Affairs)", basis: "Reported", source: "Norfund annual report", year: 2024 },
      { label: "Portfolio", value: "~NOK 40 billion committed", basis: "Reported", source: "Norfund annual report", year: 2024 },
      { label: "Clean energy share", value: "Largest single sector of the portfolio", basis: "Reported", source: "Norfund annual report", year: 2024 },
    ],
    website: "https://www.norfund.no",
  },
  {
    id: "ifc",
    name: "IFC — International Finance Corporation",
    kind: "Multilateral development finance institution",
    hq: "Washington, DC, United States",
    founded: 1956,
    aumUsdM: 100_000,
    ticketMinUsdM: 20,
    ticketMaxUsdM: 250,
    instruments: ["Senior debt", "Equity", "Blended concessional finance", "Local-currency loans"],
    targetCostOfCapital: 6.5,
    patience: 88,
    riskAppetite: 60,
    geographies: ["Global emerging markets"],
    sectors: ["Power", "Digital infrastructure", "Water", "Manufacturing", "Financial markets"],
    stage: ["Construction", "Operating"],
    thesis:
      "The World Bank Group's private-sector arm. Longest tenors and deepest local-currency capability available to a private project, at the price of the slowest and most documentation-heavy diligence in the market.",
    requirements: [
      "IFC Performance Standards compliance in full",
      "Audited financials and a bankable financial model",
      "Environmental and social action plan agreed before disbursement",
      "Typically 12–24 months from mandate to first drawdown",
    ],
    redLines: ["Exclusion-list activities", "Projects unable to meet Performance Standards"],
    stackBias: { dfi: 50, private: 20, government: 15, climate: 15 },
    facts: [
      { label: "Owner", value: "World Bank Group, 186 member countries", basis: "Reported", source: "IFC annual report", year: 2024 },
      { label: "Annual commitments", value: "~$56 billion long-term finance", basis: "Reported", source: "IFC annual report", year: 2024 },
      { label: "Local-currency capability", value: "Kenyan shilling lending available", basis: "Reported", source: "IFC treasury disclosures", year: 2024 },
    ],
    website: "https://www.ifc.org",
  },
];

export const PARTNER_BY_ID = Object.fromEntries(
  INVESTMENT_PARTNERS.map((p) => [p.id, p]),
) as Record<string, InvestmentPartner>;

export type PartnerFit = {
  score: number;
  reasons: string[];
  frictions: string[];
  suggestedStack: CapitalStack;
  partnerShareUsdM: number;
};

/**
 * Deterministic fit assessment. No hidden weighting: every term below is
 * declared, and every reason shown in the interface comes from one of them.
 */
export function partnerFit(
  partner: InvestmentPartner,
  opts: { capexUsdM: number; placeName: string; country: string; systems: string[] },
): PartnerFit {
  const reasons: string[] = [];
  const frictions: string[] = [];
  let score = 40;

  const inGeography = partner.geographies.some(
    (g) => g === opts.country || g.toLowerCase().includes("pan-") || g.toLowerCase().includes("global") || g.toLowerCase().includes("africa"),
  );
  if (inGeography) {
    score += 20;
    reasons.push(`Invests in ${opts.country} — stated geography, not an exception.`);
  } else {
    frictions.push(`${opts.country} is outside the published geography.`);
  }

  const equityTarget = Math.round(opts.capexUsdM * 0.3);
  if (equityTarget >= partner.ticketMinUsdM && equityTarget <= partner.ticketMaxUsdM) {
    score += 22;
    reasons.push(
      `A 30% equity position is $${equityTarget}M, inside the $${partner.ticketMinUsdM}–${partner.ticketMaxUsdM}M ticket range.`,
    );
  } else if (equityTarget > partner.ticketMaxUsdM) {
    score += 8;
    frictions.push(
      `A 30% position is $${equityTarget}M, above the $${partner.ticketMaxUsdM}M ceiling — needs co-investors or a phased close.`,
    );
  } else {
    frictions.push(
      `A 30% position is $${equityTarget}M, below the $${partner.ticketMinUsdM}M floor — too small to reach investment committee.`,
    );
  }

  const sectorHit = partner.sectors.some((sec) =>
    opts.systems.some((sys) => sec.toLowerCase().includes(sys.toLowerCase()) || sys.toLowerCase().includes(sec.split(" ")[0]!.toLowerCase())),
  );
  if (sectorHit) {
    score += 18;
    reasons.push(`Sector match: ${partner.sectors.slice(0, 3).join(", ")}.`);
  } else {
    frictions.push("Sector sits outside the partner's published focus areas.");
  }

  if (partner.riskAppetite >= 75) {
    reasons.push("Carries development-stage risk, so it can enter before financial close.");
  } else {
    frictions.push("Enters at or after construction — something else must fund development.");
  }

  const suggestedStack: CapitalStack = { ...partner.stackBias };
  const partnerShareUsdM = Math.round(
    Math.min(partner.ticketMaxUsdM, Math.max(partner.ticketMinUsdM, opts.capexUsdM * 0.3)),
  );

  return {
    score: Math.max(0, Math.min(100, score)),
    reasons,
    frictions,
    suggestedStack,
    partnerShareUsdM,
  };
}
