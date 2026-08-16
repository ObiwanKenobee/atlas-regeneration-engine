import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Shell } from "@/components/atlas/Shell";
import { WorldCanvas } from "@/components/atlas/WorldCanvas";
import { PLACES, SEARCH_SUGGESTIONS, SYSTEMS } from "@/lib/atlas/data";
import { rici } from "@/lib/atlas/model";
import { Chip } from "@/components/atlas/ui";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Atlas Sanctum — Regenerative Infrastructure Intelligence Observatory" },
      {
        name: "description",
        content:
          "A living observatory for infrastructure: explore, diagnose, simulate futures, design interventions, coordinate capital and measure regenerative impact.",
      },
      { property: "og:title", content: "Atlas Sanctum — Regenerative Infrastructure Intelligence" },
      {
        property: "og:description",
        content:
          "What future do we want to make possible—and what infrastructure would make it real?",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const ENTRIES = [
  { to: "/explore", title: "PLACES", body: "Explore infrastructure systems geographically." },
  { to: "/explore", title: "SYSTEMS", body: "Energy, water, compute, mobility, health, food, nature." },
  { to: "/explore", title: "OPPORTUNITIES", body: "Discover infrastructure gaps and investment opportunities." },
  { to: "/simulate", title: "FUTURES", body: "Simulate alternative infrastructure futures." },
  { to: "/projects", title: "PROJECTS", body: "Explore proposed and active infrastructure projects." },
  { to: "/capital", title: "CAPITAL", body: "Understand where capital is moving." },
] as const;

function Home() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const matches = query
    ? PLACES.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
    : [];

  return (
    <Shell>
      <div className="relative">
        <WorldCanvas
          activeSystems={SYSTEMS.map((s) => s.id)}
          className="h-[58vh] min-h-[420px] w-full"
        />
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <h1 className="font-display text-4xl tracking-[0.22em] sm:text-6xl">ATLAS SANCTUM</h1>
          <p className="label-xs mt-3 text-primary">Regenerative Infrastructure Intelligence</p>
          <p className="mt-4 max-w-xl text-sm text-muted-foreground">
            What future do we want to make possible—and what infrastructure would make it real?
          </p>

          <form
            className="pointer-events-auto mt-6 w-full max-w-2xl"
            onSubmit={(e) => {
              e.preventDefault();
              const hit = matches[0];
              void navigate({ to: "/explore", search: hit ? { place: hit.id } : undefined });
            }}
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a place, infrastructure system, opportunity, or future..."
              className="w-full rounded-sm border border-border bg-background/85 px-4 py-3.5 text-sm outline-none backdrop-blur-md placeholder:text-muted-foreground focus:border-primary/70"
            />
            {matches.length > 0 && (
              <ul className="mt-1 overflow-hidden rounded-sm border border-border bg-surface-2 text-left backdrop-blur-xl">
                {matches.map((m) => (
                  <li key={m.id}>
                    <Link
                      to="/explore"
                      search={{ place: m.id }}
                      className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-primary/10"
                    >
                      <span>{m.name}</span>
                      <span className="num text-xs text-primary">RICI {rici(m.indicators).toFixed(1)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </form>

          <div className="pointer-events-auto mt-4 flex max-w-3xl flex-wrap justify-center gap-2">
            {SEARCH_SUGGESTIONS.map((s) => (
              <Chip key={s} onClick={() => setQuery(s)}>
                {s}
              </Chip>
            ))}
          </div>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="label-xs">What do you want to explore?</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ENTRIES.map((e) => (
            <Link
              key={e.title}
              to={e.to}
              className="panel group rounded-lg p-5 transition-all hover:border-primary/60 hover:bg-surface-2"
            >
              <div className="flex items-start justify-between">
                <span className="font-display text-lg tracking-[0.2em]">{e.title}</span>
                <span className="label-xs text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  ENTER →
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{e.body}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["What exists?", "Assets, systems and the dependencies between them."],
          ["What is constrained?", "The binding limit is rarely the one being funded."],
          ["What is becoming possible?", "Cost curves change what is buildable before policy notices."],
          ["What should we build?", "Interventions evaluated across seven forms of capital."],
        ].map(([q, a]) => (
          <div key={q} className="rounded-lg border border-border p-4">
            <div className="font-display text-sm text-primary">{q}</div>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{a}</p>
          </div>
        ))}
      </section>
    </Shell>
  );
}
