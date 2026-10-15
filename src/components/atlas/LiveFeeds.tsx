import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getPowerPlants, getWorldBankIndicators } from "@/lib/atlas/livedata.functions";
import { Panel } from "./ui";

const fmt = (id: string, v: number) =>
  id === "NY.GDP.PCAP.CD" ? `$${Math.round(v).toLocaleString()}` : `${v.toFixed(1)}%`;

function FeedStatus({ ok, fetchedAt, source, licence, error, loading }: { ok?: boolean; fetchedAt?: string; source: string; licence: string; error?: string; loading: boolean }) {
  return (
    <div className="label-xs mt-3 flex flex-wrap items-center gap-2 text-[9px]">
      <i
        className="size-1.5 rounded-full"
        style={{ background: loading ? "var(--warn)" : ok ? "var(--good)" : "var(--danger)" }}
      />
      {loading ? "Fetching live" : ok ? "Live · Observed" : `Feed unavailable — ${error ?? "no response"}. Nothing shown rather than a guess.`}
      <span className="text-muted-foreground">
        · {source} · {licence}
        {fetchedAt && ok ? ` · fetched ${fetchedAt.slice(0, 16).replace("T", " ")} UTC` : ""}
      </span>
    </div>
  );
}

export function LiveIndicatorsPanel() {
  const fetchFeed = useServerFn(getWorldBankIndicators);
  const q = useQuery({ queryKey: ["wb-indicators"], queryFn: () => fetchFeed(), staleTime: 1000 * 60 * 60 });
  const rows = q.data?.rows ?? [];
  const countries = Array.from(new Set(rows.map((r) => r.country)));
  const indicators = Array.from(new Map(rows.map((r) => [r.indicatorId, r.indicator])).entries());

  return (
    <Panel label="Live open-data feed · World Bank" right={<span className="label-xs text-good">OBSERVED</span>}>
      {rows.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="label-xs text-left">
                <th className="py-1.5 pr-3 font-normal">Indicator</th>
                {countries.map((c) => (
                  <th key={c} className="py-1.5 pr-3 text-right font-normal">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {indicators.map(([id, label]) => (
                <tr key={id} className="border-t border-border">
                  <td className="py-1.5 pr-3 text-muted-foreground">{label}</td>
                  {countries.map((c) => {
                    const r = rows.find((x) => x.country === c && x.indicatorId === id);
                    return (
                      <td key={c} className="num py-1.5 pr-3 text-right">
                        {r ? fmt(id, r.value) : "—"}
                        {r && <span className="ml-1 text-[9px] text-muted-foreground">{r.year}</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !q.isLoading && <p className="text-[12px] text-muted-foreground">No live values returned.</p>
      )}
      <FeedStatus loading={q.isLoading} ok={q.data?.ok} fetchedAt={q.data?.fetchedAt} source="World Bank Open Data API" licence="CC BY 4.0" error={q.data?.error} />
    </Panel>
  );
}

export function LivePlantsPanel({ iso2, countryName }: { iso2: string; countryName: string }) {
  const fetchPlants = useServerFn(getPowerPlants);
  const q = useQuery({
    queryKey: ["osm-plants", iso2],
    queryFn: () => fetchPlants({ data: { iso2 } }),
    staleTime: 1000 * 60 * 60,
  });
  const plants = q.data?.plants ?? [];
  const totalMw = plants.reduce((a, p) => a + (p.outputMw ?? 0), 0);

  return (
    <Panel label={`Real power plants · ${countryName}`} right={<span className="label-xs">{plants.length} mapped</span>}>
      {plants.length > 0 && (
        <>
          <p className="mb-2 text-[12px] text-muted-foreground">
            {Math.round(totalMw).toLocaleString()} MW tagged with rated output across {plants.filter((p) => p.outputMw).length} plants. Untagged plants are listed without a number.
          </p>
          <ul className="max-h-[320px] space-y-1.5 overflow-y-auto pr-1">
            {plants.slice(0, 40).map((p) => (
              <li key={p.id} className="flex items-start justify-between gap-3 border-b border-border pb-1.5 text-[12px] last:border-0">
                <div className="min-w-0">
                  <a
                    href={`https://www.openstreetmap.org/${p.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate hover:text-primary"
                  >
                    {p.name}
                  </a>
                  <div className="label-xs text-[9px]">
                    {[p.source, p.operator].filter(Boolean).join(" · ") || "source untagged"}
                  </div>
                </div>
                <span className="num shrink-0 text-primary">{p.outputMw ? `${Math.round(p.outputMw)} MW` : "—"}</span>
              </li>
            ))}
          </ul>
        </>
      )}
      <FeedStatus loading={q.isLoading} ok={q.data?.ok} fetchedAt={q.data?.fetchedAt} source="OpenStreetMap via Overpass" licence="ODbL 1.0" error={q.data?.error} />
    </Panel>
  );
}
