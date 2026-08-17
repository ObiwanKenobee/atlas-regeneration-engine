import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/atlas/Shell";
import { AtlasCopilot } from "@/components/atlas/AtlasCopilot";
import { Panel, SectionTitle } from "@/components/atlas/ui";

export const Route = createFileRoute("/atlas")({
  head: () => ({
    meta: [
      { title: "Atlas AI — Natural-Language Infrastructure Intelligence" },
      {
        name: "description",
        content:
          "Ask Atlas about bottlenecks, opportunities, resilience strategies and capital — with provenance, confidence and an explicit account of what it cannot see.",
      },
      { property: "og:title", content: "Atlas AI — infrastructure copilot" },
      {
        property: "og:description",
        content: "Every answer labels what is observed, estimated, modelled, forecast or unknown.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AtlasAI,
});

function AtlasAI() {
  return (
    <Shell>
      <SectionTitle
        kicker="Atlas AI"
        title="Ask the observatory"
        sub="Atlas distinguishes observed, estimated, modelled, forecast and unknown — and always ends by saying what it is not seeing."
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Panel label="Copilot">
          <AtlasCopilot
            placeholder="What is the biggest infrastructure bottleneck in Nairobi?"
            context="The user is exploring East African infrastructure with energy, compute and water layers active."
            suggestions={[
              "What is the biggest infrastructure bottleneck in Nairobi?",
              "Where could renewable energy unlock the most economic activity?",
              "What infrastructure would make this region more resilient to drought?",
              "Find opportunities where water infrastructure and agriculture intersect.",
              "Design a regenerative infrastructure strategy for western Kenya.",
              "What would happen if we invested $1 billion here?",
              "What are we missing?",
            ]}
          />
        </Panel>

        <aside className="space-y-3">
          <Panel label="How Atlas reasons">
            <ul className="space-y-2 text-[13px] text-muted-foreground">
              <li>Every claim is labelled Observed, Estimated, Modeled, Forecast or Unknown.</li>
              <li>Trade-offs are never hidden — costs, risks and losers are named.</li>
              <li>Answers end with what Atlas is not seeing and the data it would need.</li>
              <li>Precise statistics are not invented; ranges are used and marked.</li>
            </ul>
          </Panel>
          <Panel label="Trust architecture">
            <p className="text-[13px] text-muted-foreground">
              Source · timestamp · methodology · confidence · update frequency · geographic resolution
              · model version. Where any of these is missing, Atlas says so rather than filling the
              gap with confidence.
            </p>
          </Panel>
          <Panel label="The question that matters most">
            <p className="font-display text-lg leading-snug">What are we not seeing?</p>
          </Panel>
        </aside>
      </div>
    </Shell>
  );
}
