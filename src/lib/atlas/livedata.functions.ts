// Atlas Sanctum — live open-data feeds.
// Two public, no-key sources, fetched server-side so the browser never sees
// a third-party call and so failures degrade to an explicit "feed unavailable"
// state rather than an invented number.
//
//   World Bank Open Data  — national indicators, CC BY 4.0
//   OpenStreetMap Overpass — real power plants, ODbL
//
// Nothing here is modelled. Every value returned is exactly what the source
// published, with the observation year attached.

import { createServerFn } from "@tanstack/react-start";

export type LiveIndicator = {
  iso3: string;
  country: string;
  indicatorId: string;
  indicator: string;
  value: number;
  year: string;
};

export type LiveIndicatorFeed = {
  ok: boolean;
  fetchedAt: string;
  source: string;
  licence: string;
  rows: LiveIndicator[];
  error?: string;
};

const WB_COUNTRIES = ["KEN", "NGA", "ZAF", "BRA"] as const;

const WB_INDICATORS: Array<{ id: string; short: string }> = [
  { id: "EG.ELC.ACCS.ZS", short: "Electricity access (% of population)" },
  { id: "EG.ELC.RNEW.ZS", short: "Renewable share of electricity output (%)" },
  { id: "IT.NET.USER.ZS", short: "Internet users (% of population)" },
  { id: "SP.URB.TOTL.IN.ZS", short: "Urban population (% of total)" },
  { id: "NY.GDP.PCAP.CD", short: "GDP per capita (current US$)" },
];

type WbRow = {
  indicator: { id: string; value: string };
  country: { value: string };
  countryiso3code: string;
  date: string;
  value: number | null;
};

export const getWorldBankIndicators = createServerFn({ method: "GET" }).handler(
  async (): Promise<LiveIndicatorFeed> => {
    const base = "https://api.worldbank.org/v2/country";
    const countries = WB_COUNTRIES.join(";");
    try {
      const results = await Promise.all(
        WB_INDICATORS.map(async (ind) => {
          const url = `${base}/${countries}/indicator/${ind.id}?format=json&mrnev=1&per_page=50`;
          const res = await fetch(url, { headers: { accept: "application/json" } });
          if (!res.ok) throw new Error(`World Bank responded ${res.status}`);
          const body = (await res.json()) as [unknown, WbRow[] | null];
          const rows = body[1] ?? [];
          return rows
            .filter((r) => typeof r.value === "number")
            .map<LiveIndicator>((r) => ({
              iso3: r.countryiso3code,
              country: r.country.value,
              indicatorId: r.indicator.id,
              indicator: ind.short,
              value: r.value as number,
              year: r.date,
            }));
        }),
      );
      return {
        ok: true,
        fetchedAt: new Date().toISOString(),
        source: "World Bank Open Data API",
        licence: "CC BY 4.0",
        rows: results.flat(),
      };
    } catch (error) {
      return {
        ok: false,
        fetchedAt: new Date().toISOString(),
        source: "World Bank Open Data API",
        licence: "CC BY 4.0",
        rows: [],
        error: error instanceof Error ? error.message : "Feed unavailable",
      };
    }
  },
);

export type LivePlant = {
  id: string;
  name: string;
  operator?: string | undefined;
  method?: string | undefined;
  source?: string | undefined;
  outputMw?: number | undefined;
  lat: number;
  lon: number;
};

export type LivePlantFeed = {
  ok: boolean;
  fetchedAt: string;
  iso2: string;
  source: string;
  licence: string;
  plants: LivePlant[];
  error?: string;
};

type OverpassElement = {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

function parseMw(raw?: string): number | undefined {
  if (!raw) return undefined;
  const match = raw.match(/([\d.]+)\s*(k|M|G)?W/i);
  if (!match) return undefined;
  const n = Number(match[1]);
  if (!Number.isFinite(n)) return undefined;
  const unit = (match[2] ?? "M").toUpperCase();
  if (unit === "K") return n / 1000;
  if (unit === "G") return n * 1000;
  return n;
}

export const getPowerPlants = createServerFn({ method: "GET" })
  .inputValidator((input: { iso2?: string }) => ({
    iso2: (input?.iso2 ?? "KE").toUpperCase().slice(0, 2),
  }))
  .handler(async ({ data }): Promise<LivePlantFeed> => {
    const query = `[out:json][timeout:40];area["ISO3166-1"="${data.iso2}"][admin_level=2]->.a;(node["power"="plant"](area.a);way["power"="plant"](area.a);relation["power"="plant"](area.a););out center tags 120;`;
    try {
      const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(query)}`,
      });
      if (!res.ok) throw new Error(`Overpass responded ${res.status}`);
      const body = (await res.json()) as { elements: OverpassElement[] };
      const plants = (body.elements ?? [])
        .map<LivePlant | null>((el) => {
          const lat = el.lat ?? el.center?.lat;
          const lon = el.lon ?? el.center?.lon;
          const tags = el.tags ?? {};
          if (lat === undefined || lon === undefined || !tags["name"]) return null;
          return {
            id: `${el.type}/${el.id}`,
            name: tags["name"],
            operator: tags["operator"],
            method: tags["plant:method"],
            source: tags["plant:source"],
            outputMw: parseMw(tags["plant:output:electricity"]),
            lat,
            lon,
          };
        })
        .filter((p): p is LivePlant => p !== null)
        .sort((a, b) => (b.outputMw ?? 0) - (a.outputMw ?? 0));
      return {
        ok: true,
        fetchedAt: new Date().toISOString(),
        iso2: data.iso2,
        source: "OpenStreetMap via Overpass API",
        licence: "ODbL 1.0",
        plants,
      };
    } catch (error) {
      return {
        ok: false,
        fetchedAt: new Date().toISOString(),
        iso2: data.iso2,
        source: "OpenStreetMap via Overpass API",
        licence: "ODbL 1.0",
        plants: [],
        error: error instanceof Error ? error.message : "Feed unavailable",
      };
    }
  });
