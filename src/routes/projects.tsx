import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/atlas/Shell";
import { ActionButton, Chip, Meter, Panel, ProvenanceTag, SectionTitle, Stat } from "@/components/atlas/ui";
import { LIFECYCLE, OPPORTUNITIES, PLACE_BY_ID, PROJECTS, SYSTEM_BY_ID } from "@/lib/atlas/data";
import { fmtNum, fmtUsdM, stackAnalysis, type CapitalStack } from "@/lib/atlas/model";
import { BasisChip, FactList } from "@/components/atlas/ui";
import { CAPITAL_SOURCES } from "@/lib/atlas/data";
import { FLAGSHIP } from "@/lib/atlas/flagship";
import { INVESTMENT_PARTNERS, partnerFit } from "@/lib/atlas/partners";
import { downloadReport, projectProposal } from "@/lib/atlas/report";

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
  const [generated, setGenerated] = useState<string | null>(OPPORTUNITIES[0]!.id);
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

      <FlagshipWalk />

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

const STEPS = ["1 · DESIGN", "2 · FINANCE", "3 · PROPOSAL"] as const;

function FlagshipWalk() {
  const f = FLAGSHIP;
  const [step, setStep] = useState<(typeof STEPS)[number]>("1 · DESIGN");
  const [partnerId, setPartnerId] = useState("norfund");
  const [stack, setStack] = useState<CapitalStack>(f.stack);
  const partner = INVESTMENT_PARTNERS.find((p) => p.id === partnerId)!;
  const fit = partnerFit(partner, { capexUsdM: f.capexUsdM, placeName: "Nairobi", country: "Kenya", systems: ["energy", "Renewable"] });
  const analysis = stackAnalysis(stack, f.capexUsdM);
  const revenueUsdM = (f.annualGenerationGwh * 1e6 * f.tariffUsdPerKwh) / 1e6;
  const savingsUsdM = (f.annualGenerationGwh * 1e6 * (f.dieselDisplacedUsdPerKwh - f.tariffUsdPerKwh)) / 1e6;

  return (
    <Panel label="Worked example · full lifecycle" className="mb-4" right={<span className="label-xs text-primary">NAIROBI · SOLAR + STORAGE</span>}>
      <h3 className="font-display text-2xl tracking-tight">{f.name}</h3>
      <p className="label-xs mt-0.5">{f.location}</p>
      <p className="mt-2 max-w-3xl text-[13px] text-muted-foreground">{f.summary}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {STEPS.map((s) => (
          <Chip key={s} active={s === step} onClick={() => setStep(s)}>{s}</Chip>
        ))}
      </div>

      {step === "1 · DESIGN" && (
        <div className="animate-rise mt-4 grid gap-4 lg:grid-cols-2">
          <div>
            <div className="label-xs text-primary">System design</div>
            <ul className="mt-2 space-y-1.5 text-[13px]">
              {f.designItems.map((d) => <li key={d.componentId} className="rounded-sm border border-border px-3 py-2">{d.label}</li>)}
            </ul>
            <div className="mt-4 grid grid-cols-2 gap-5 sm:grid-cols-3">
              <Stat label="Capex" value={fmtUsdM(f.capexUsdM)} tone="primary" />
              <Stat label="Generation" value={f.annualGenerationGwh} unit="GWh/yr" />
              <Stat label="CO₂e avoided" value={fmtNum(f.co2AvoidedTpa)} unit="t/yr" tone="good" />
              <Stat label="Offtakers" value={f.offtakers} />
              <Stat label="Jobs" value={`${f.jobsConstruction} / ${f.jobsPermanent}`} hint="construction / permanent" />
              <Stat label="Land" value={f.landHa} unit="ha" />
            </div>
            <p className="mt-3 text-[12px] text-muted-foreground"><span className="text-foreground">Why here — </span>{f.whyHere}</p>
            <Link to="/design" search={{ place: "nairobi" }}><ActionButton variant="ghost" className="mt-3">OPEN IN DESIGN STUDIO</ActionButton></Link>
          </div>
          <div>
            <div className="label-xs text-primary">Benchmarks behind the design</div>
            <div className="mt-2"><FactList facts={f.facts} /></div>
          </div>
        </div>
      )}

      {step === "2 · FINANCE" && (
        <div className="animate-rise mt-4 grid gap-4 lg:grid-cols-2">
          <div>
            <div className="label-xs text-primary">Lead investment partner</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {INVESTMENT_PARTNERS.map((p) => (
                <Chip key={p.id} active={p.id === partnerId} onClick={() => { setPartnerId(p.id); }}>{p.name.split(" — ")[0]}</Chip>
              ))}
            </div>
            <p className="mt-3 text-[13px] text-muted-foreground">{partner.thesis}</p>
            <ul className="mt-2 space-y-1 text-[12px] text-muted-foreground">
              {fit.reasons.map((r) => <li key={r}>+ {r}</li>)}
              {fit.frictions.map((r) => <li key={r} className="text-warn">− {r}</li>)}
            </ul>
            <div className="mt-3 flex flex-wrap gap-2">
              <ActionButton onClick={() => setStack({ ...fit.suggestedStack })}>APPLY PARTNER-LED STACK</ActionButton>
              <ActionButton variant="ghost" onClick={() => setStack(f.stack)}>ATLAS RECOMMENDED STACK</ActionButton>
            </div>
          </div>
          <div>
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
              <Stat label="Partner fit" value={fit.score} unit="/100" tone={fit.score >= 70 ? "good" : "warn"} />
              <Stat label="Indicative ticket" value={fmtUsdM(fit.partnerShareUsdM)} tone="primary" />
              <Stat label="Blended cost" value={`${analysis.blendedCost}%`} cite="capital.blendedCost" />
              <Stat label="Annual service" value={fmtUsdM(analysis.annualDebtServiceUsdM)} cite="capital.annualService" />
              <Stat label="PPA revenue" value={fmtUsdM(revenueUsdM)} unit="/yr" hint="Modeled" />
              <Stat label="Offtaker savings" value={fmtUsdM(savingsUsdM)} unit="/yr" tone="good" hint="vs diesel-blended" />
            </div>
            <ul className="mt-4 space-y-1 text-[12px]">
              {CAPITAL_SOURCES.filter((s) => (stack[s.id] ?? 0) > 0).map((s) => (
                <li key={s.id} className="flex justify-between border-b border-border pb-1">
                  <span>{s.label}</span>
                  <span className="num">{stack[s.id]}% · {fmtUsdM(((stack[s.id] ?? 0) / Math.max(1, analysis.total)) * f.capexUsdM)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3"><Meter label="Feasibility" value={analysis.feasibility} color="var(--good)" cite="capital.feasibility" /></div>
          </div>
        </div>
      )}

      {step === "3 · PROPOSAL" && (
        <div className="animate-rise mt-4 space-y-4">
          <div>
            <div className="label-xs text-primary">Budget · {fmtUsdM(f.capexUsdM)}</div>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-[12px]">
                <tbody>
                  {f.budget.map((b) => (
                    <tr key={b.item} className="border-b border-border">
                      <td className="py-1.5 pr-3">{b.item}<div className="text-[11px] text-muted-foreground">{b.note}</div></td>
                      <td className="num py-1.5 pr-3 text-right">{fmtUsdM(b.amountUsdM)}</td>
                      <td className="num py-1.5 pr-3 text-right text-muted-foreground">{b.share}%</td>
                      <td className="py-1.5 text-right"><BasisChip basis={b.basis} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <div className="label-xs text-primary">Stakeholders</div>
            <div className="mt-2 grid gap-2 md:grid-cols-2">
              {f.stakeholders.map((s) => (
                <div key={s.name} className="rounded-sm border border-border p-3 text-[12px]">
                  <div className="flex justify-between gap-2"><span className="text-[13px]">{s.name}</span><span className="label-xs text-accent">{s.status}</span></div>
                  <div className="label-xs mt-0.5">{s.role}</div>
                  <p className="mt-1 text-muted-foreground">{s.interest}</p>
                  <p className="mt-1"><span className="text-muted-foreground">Ask — </span>{s.commitment}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="label-xs text-primary">Delivery plan</div>
              <ul className="mt-2 space-y-1 text-[12px] text-muted-foreground">
                {f.milestones.map((m) => <li key={m.stage}><span className="text-foreground">{m.stage}</span> · {m.window} — {m.gate}</li>)}
              </ul>
            </div>
            <div>
              <div className="label-xs text-primary">Risk register</div>
              <ul className="mt-2 space-y-1 text-[12px] text-muted-foreground">
                {f.risks.map((r) => <li key={r.risk}><span className="text-foreground">{r.risk}</span> — {r.mitigation}</li>)}
              </ul>
            </div>
          </div>
          <ActionButton
            variant="accent"
            className="w-full"
            onClick={() => downloadReport(projectProposal(f, stack, analysis, { name: partner.name, shareUsdM: fit.partnerShareUsdM, score: fit.score }))}
          >
            EXPORT PROJECT PROPOSAL
          </ActionButton>
          <p className="label-xs text-[9px]">Budget lines are Atlas estimates benchmarked to the cited sources; stakeholder statuses are illustrative planning states, not confirmed commitments.</p>
        </div>
      )}
    </Panel>
  );
}
