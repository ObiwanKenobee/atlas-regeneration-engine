import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/atlas/Shell";
import { ActionButton, Chip, Panel, ProvenanceTag, SectionTitle, Stat } from "@/components/atlas/ui";
import { LIFECYCLE, OPPORTUNITIES, PLACE_BY_ID, PROJECTS, SYSTEM_BY_ID } from "@/lib/atlas/data";
import { fmtNum, fmtUsdM } from "@/lib/atlas/model";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — From Opportunity to Infrastructure | Atlas Sanctum" },
      {
        name: "description",
        content:
          "Convert opportunities into projects with a thesis, design, capital plan, risk register, governance and monitoring framework — then track the lifecycle.",
      },
      { property: "og:title", content: "Atlas Projects" },
      {
        property: "og:description",
        content: "Discover, diagnose, design, validate, finance, build, operate, measure, regenerate, scale.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Projects,
});

const TWIN_QUESTIONS = [
  { q: "What happens if rainfall decreases 20%?", a: "Modeled: raw water availability falls ~14% in the dry quarter. Reuse capacity becomes the binding supply. Recommend contracting 12,000 m³/d of reuse and shifting irrigation offtake to night hours. Revenue exposure: 6–9%." },
  { q: "What happens if electricity demand increases 40%?", a: "Modeled: distribution feeders reach N-1 violation at ~28% growth. Storage dispatch covers 11 of the 19 constrained hours. Requires +34 MW firm capacity or a curtailment contract. Capex delta: $41–58M (Estimated)." },
  { q: "What happens if the project loses 15% of expected revenue?", a: "Modeled: DSCR falls from 1.42 to 1.18, below the 1.25 covenant. Mitigations: extend tenor 4 years, convert 8% of the stack to concessional, or add an outcome-based tranche. Sponsor equity IRR drops ~2.6pp." },
  { q: "What happens if restoration expands by 50 hectares?", a: "Modeled: +390 tCO₂e/yr sequestration, measurable base-flow improvement after ~3 years, +38 seasonal livelihoods. Natural capital +6 points; financial capital −1.4 points. Net regenerative value positive (Low confidence)." },
  { q: "What happens if AI compute demand doubles?", a: "Modeled: campus load moves from 24 MW to 48 MW; water demand doubles unless cooling is closed-loop. Grid headroom is exhausted — the project becomes a generation project first and a compute project second." },
];

function Projects() {
  const [generated, setGenerated] = useState<string | null>(null);
  const [twin, setTwin] = useState<number | null>(null);
  const [oppId, setOppId] = useState(OPPORTUNITIES[0]!.id);
  const opp = OPPORTUNITIES.find((o) => o.id === oppId)!;

  return (
    <Shell>
      <SectionTitle
        kicker="Projects"
        title="From opportunity to infrastructure"
        sub="A project is an opportunity that has accepted its constraints."
      />

      <Panel label="Project lifecycle" className="mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {LIFECYCLE.map((stage) => {
            const inStage = PROJECTS.filter((p) => p.stage === stage);
            return (
              <div key={stage} className="min-w-[168px] flex-1 rounded-sm border border-border p-3">
                <div className="label-xs text-primary">{stage}</div>
                <div className="mt-2 space-y-2">
                  {inStage.map((p) => (
                    <div key={p.id} className="rounded-sm border border-border bg-surface-2 p-2">
                      <div className="text-[12px] leading-snug">{p.name}</div>
                      <div className="num mt-1 text-[10px] text-muted-foreground">
                        {fmtUsdM(p.capitalUsdM)} · RICI {p.rici}
                      </div>
                    </div>
                  ))}
                  {inStage.length === 0 && <div className="label-xs opacity-40">—</div>}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel label="Project generator">
          <div className="flex flex-wrap gap-1.5">
            {OPPORTUNITIES.map((o) => (
              <Chip key={o.id} active={o.id === oppId} onClick={() => { setOppId(o.id); setGenerated(null); }}>
                {o.title}
              </Chip>
            ))}
          </div>
          <ActionButton className="mt-4 w-full" onClick={() => setGenerated(opp.id)}>
            CREATE PROJECT
          </ActionButton>

          {generated === opp.id && (
            <div className="animate-rise mt-4 space-y-3 text-[13px]">
              <Field label="Project thesis" body={`${opp.title} converts a recurring cost into an owned asset. ${opp.opportunity}`} />
              <Field label="Problem statement" body={opp.problem} />
              <Field label="Infrastructure design" body={`Modular deployment across ${opp.systems.map((s) => SYSTEM_BY_ID[s].label).join(", ")} with staged commissioning.`} />
              <Field label="Site & technology requirements" body="Interconnection studies, land tenure verification, tier-1 equipment with local O&M capability and 15-year spares." />
              <Field label="Capital requirements" body={`${fmtUsdM(opp.capitalUsdM)} total; 18% contingency; blended stack across concessional, commercial and community tranches.`} />
              <Field label="Stakeholders" body={opp.whoParticipates.join(" · ")} />
              <Field label="Implementation phases" body="Phase 0 diagnostics · Phase 1 pilot node · Phase 2 replication · Phase 3 network operation · Phase 4 transfer." />
              <Field label="Risk register" body={opp.whatCouldPrevent.join(" · ")} />
              <Field label="Impact metrics" body={`${fmtNum(opp.beneficiaries)} beneficiaries · +${opp.resilienceGainPct}% resilience · ${fmtNum(opp.emissionsTco2e)} tCO₂e avoided · verified quarterly.`} />
              <Field label="Governance model" body="Special purpose vehicle with community ownership tranche, independent technical auditor and published performance data." />
              <Field label="Revenue model" body="Contracted availability payments plus avoided-cost sharing with hosts; outcome-linked tranche for measured resilience." />
              <Field label="Regenerative value model" body="Value accrues to natural and social capital first; financial return is the constraint, not the objective." />
              <Field label="Monitoring framework" body="Metering at asset level, independent verification annually, open methodology, provenance published with every figure." />
              <ProvenanceTag method="Modeled" confidence={opp.confidence} source="Atlas project generator — template synthesis over the opportunity record; requires human diligence before use." />
            </div>
          )}
        </Panel>

        <div className="space-y-4">
          <Panel label="Infrastructure digital twin">
            <p className="text-sm text-muted-foreground">
              For mature projects, Atlas binds physical infrastructure, live data, environmental
              conditions, financial performance and human outcomes into one queryable model.
            </p>
            <div className="mt-3 space-y-2">
              {TWIN_QUESTIONS.map((t, i) => (
                <div key={t.q}>
                  <button
                    onClick={() => setTwin(twin === i ? null : i)}
                    className="w-full rounded-sm border border-border px-3 py-2.5 text-left text-[13px] transition-colors hover:border-primary/50"
                  >
                    {t.q}
                  </button>
                  {twin === i && (
                    <p className="animate-rise mt-1.5 rounded-sm border border-primary/30 bg-primary/8 p-3 text-[13px] leading-relaxed text-muted-foreground">
                      {t.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Panel>

          <Panel label="Active portfolio">
            <ul className="space-y-2">
              {PROJECTS.map((p) => (
                <li key={p.id} className="rounded-sm border border-border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[13px]">{p.name}</div>
                      <div className="label-xs mt-0.5">
                        {PLACE_BY_ID[p.placeId]?.name} · {p.stage}
                      </div>
                    </div>
                    <Stat label="Capital" value={fmtUsdM(p.capitalUsdM)} />
                  </div>
                  <p className="mt-2 text-[12px] text-muted-foreground">{p.thesis}</p>
                </li>
              ))}
            </ul>
            <Link to="/impact">
              <ActionButton variant="ghost" className="mt-4 w-full">MEASURE THE OUTCOMES</ActionButton>
            </Link>
          </Panel>
        </div>
      </div>
    </Shell>
  );
}

function Field({ label, body }: { label: string; body: string }) {
  return (
    <div className="rounded-sm border border-border p-3">
      <div className="label-xs text-primary">{label}</div>
      <p className="mt-1 leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
