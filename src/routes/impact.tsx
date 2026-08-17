import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/atlas/Shell";
import { CapitalsRadar } from "@/components/atlas/CapitalsRadar";
import { Chip, Meter, Panel, ProvenanceTag, SectionTitle, Stat } from "@/components/atlas/ui";
import { OPPORTUNITIES, PLACES, PLACE_BY_ID, SEVEN_CAPITALS } from "@/lib/atlas/data";
import { fmtNum, integrityAssessment, rici } from "@/lib/atlas/model";

export const Route = createFileRoute("/impact")({
  head: () => ({
    meta: [
      { title: "Impact — Human, Ecological and Financial Outcomes | Atlas Sanctum" },
      {
        name: "description",
        content:
          "The human impact lens and regenerative integrity assessment: who benefits, who pays, who bears risk, and what we still do not know.",
      },
      { property: "og:title", content: "Impact and the human lens" },
      {
        property: "og:description",
        content: "Infrastructure modelled from the perspective of the people who live with it.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Impact,
});

const LOOP = [
  ["SEE", "Understand reality."],
  ["QUESTION", "Ask what is possible."],
  ["MODEL", "Explore alternative futures."],
  ["DESIGN", "Construct interventions."],
  ["FINANCE", "Coordinate capital."],
  ["BUILD", "Deploy infrastructure."],
  ["MEASURE", "Observe outcomes."],
  ["LEARN", "Update intelligence."],
  ["REGENERATE", "Increase system capacity."],
  ["REINVEST", "Deploy into the next opportunity."],
] as const;

function Impact() {
  const [placeId, setPlaceId] = useState("nairobi");
  const [oppId, setOppId] = useState(OPPORTUNITIES[0]!.id);
  const place = PLACE_BY_ID[placeId] ?? PLACES[0]!;
  const opp = OPPORTUNITIES.find((o) => o.id === oppId)!;
  const integrity = integrityAssessment(opp.capitals, -opp.emissionsTco2e);

  const p = place.population;

  return (
    <Shell>
      <SectionTitle
        kicker="Impact"
        title="Who lives here?"
        sub="Infrastructure must never be modelled only from the perspective of investors."
      />

      <div className="mb-4 flex flex-wrap gap-1.5">
        {PLACES.filter((x) => x.id !== "world").map((x) => (
          <Chip key={x.id} active={x.id === placeId} onClick={() => setPlaceId(x.id)}>
            {x.name}
          </Chip>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
          <Panel label={`Human impact lens · ${place.name}`}>
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
              <Stat label="Population" value={fmtNum(p)} />
              <Stat label="Access to services" value={place.indicators.access} unit="/100" tone="primary" />
              <Stat label="Affordability" value={place.indicators.affordability} unit="/100" tone={place.indicators.affordability < 50 ? "warn" : "good"} />
              <Stat label="Vulnerability" value={100 - place.indicators.resilience} unit="/100" tone="danger" />
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Meter label="Health systems" value={Math.round(place.indicators.humanBenefit * 0.94)} color="var(--signal-human)" />
              <Meter label="Education" value={Math.round(place.indicators.innovationCapacity * 0.92)} color="var(--signal-human)" />
              <Meter label="Housing adequacy" value={Math.round(place.indicators.affordability * 0.88)} color="var(--signal-human)" />
              <Meter label="Employment" value={Math.round(place.indicators.humanBenefit * 0.81)} color="var(--signal-human)" />
              <Meter label="Accessibility" value={place.indicators.access} color="var(--signal-mobility)" />
              <Meter label="Ecological integrity" value={place.indicators.ecologicalIntegrity} color="var(--signal-ecology)" />
            </div>
            <ProvenanceTag
              method={place.provenance.method}
              confidence={place.provenance.confidence}
              source={place.provenance.source}
              year={place.provenance.year}
            />
          </Panel>

          <Panel label="The five questions Atlas always asks">
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Who benefits?", `Primarily the ${fmtNum(p * 0.34)} people connected to the improved system, plus firms whose outage costs fall.`],
                ["Who pays?", "Tariff payers and taxpayers, unless the capital stack is deliberately structured otherwise."],
                ["Who bears the risk?", "Today: the public balance sheet and host communities. It does not have to be that way."],
                ["Who has decision-making power?", "Utility, regulator, financier. Communities are typically consulted after design freeze."],
                ["Who is missing from the conversation?", "Informal workers, tenants, downstream water users, and future generations."],
              ].map(([q, a]) => (
                <div key={q} className="rounded-sm border border-border p-3">
                  <div className="label-xs text-primary">{q}</div>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{a}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel label="Regenerative integrity assessment" right={<span className="label-xs">{opp.title}</span>}>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {OPPORTUNITIES.map((o) => (
                <Chip key={o.id} active={o.id === oppId} onClick={() => setOppId(o.id)}>
                  {o.code.replace("OPPORTUNITY ", "")}
                </Chip>
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                {Object.entries(integrity.scores).map(([k, v]) => (
                  <div key={k}>
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-muted-foreground">{k}</span>
                      <span className="num">{v}</span>
                    </div>
                    <div className="mt-1 h-[2px] w-full bg-muted">
                      <div className="h-full" style={{ width: `${v}%`, background: v > 65 ? "var(--good)" : v > 45 ? "var(--warn)" : "var(--danger)" }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-3 text-[13px]">
                <Block label="Benefits" body={`${fmtNum(opp.beneficiaries)} beneficiaries; +${opp.resilienceGainPct}% resilience; ${fmtNum(opp.emissionsTco2e)} tCO₂e avoided.`} tone="var(--good)" />
                <Block label="Costs" body={`${opp.capitalUsdM}M capital, plus operating and maintenance obligations for 20+ years.`} tone="var(--muted-foreground)" />
                <Block label="Risks" body={opp.whatCouldPrevent.join(" · ")} tone="var(--warn)" />
                <Block label="Unknowns" body="Local hydrology, tenure, maintenance capability, political continuity." tone="var(--muted-foreground)" />
                <Block label="Trade-offs" body="Speed versus participation; financial return versus affordability; scale versus reversibility." tone="var(--accent)" />
                <Block label="Questions we still need to answer" body="Who owns this in year 25? What happens to the workforce when it is automated? What is the exit if demand never arrives?" tone="var(--primary)" />
              </div>
            </div>
          </Panel>
        </div>

        <aside className="space-y-3">
          <Panel label="Seven capitals">
            <CapitalsRadar values={opp.capitals} />
            <div className="mt-3 space-y-1.5">
              {SEVEN_CAPITALS.map((c) => (
                <div key={c.id} className="flex items-center justify-between text-[12px]">
                  <span className="text-muted-foreground" title={c.blurb}>{c.label}</span>
                  <span className="num">{opp.capitals[c.id]}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel label="Place RICI">
            <Stat label={place.name} value={rici(place.indicators).toFixed(1)} unit="/100" tone="primary" />
            <p className="mt-2 text-[12px] text-muted-foreground">
              Drill: global → country → region → city → system → asset → indicator. The methodology is
              published, not proprietary.
            </p>
          </Panel>

          <Panel label="The Atlas flywheel">
            <ol className="space-y-1.5">
              {LOOP.map(([k, v], i) => (
                <li key={k} className="flex items-baseline gap-2 text-[12px]">
                  <span className="num w-5 text-primary">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-display tracking-[0.18em]">{k}</span>
                  <span className="text-muted-foreground">{v}</span>
                </li>
              ))}
            </ol>
          </Panel>
        </aside>
      </div>
    </Shell>
  );
}

function Block({ label, body, tone }: { label: string; body: string; tone: string }) {
  return (
    <div>
      <div className="label-xs" style={{ color: tone }}>
        {label}
      </div>
      <p className="mt-1 leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
