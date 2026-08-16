import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { AtlasCopilot } from "./AtlasCopilot";

const NAV = [
  { to: "/observe", label: "OBSERVE" },
  { to: "/explore", label: "EXPLORE" },
  { to: "/simulate", label: "SIMULATE" },
  { to: "/design", label: "DESIGN" },
  { to: "/capital", label: "CAPITAL" },
  { to: "/projects", label: "PROJECTS" },
  { to: "/impact", label: "IMPACT" },
  { to: "/atlas", label: "ATLAS AI" },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-baseline gap-2.5">
            <span className="font-display text-sm tracking-[0.34em]">ATLAS SANCTUM</span>
            <span className="label-xs hidden sm:inline">Regenerative Infrastructure Intelligence</span>
          </Link>
          <nav className="-mx-1 flex flex-1 items-center gap-1 overflow-x-auto">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeProps={{ className: "text-foreground border-primary/70 bg-primary/10" }}
                className="label-xs shrink-0 rounded-sm border border-transparent px-2.5 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="label-xs hidden items-center gap-2 lg:flex">
            <i className="size-1.5 animate-pulse rounded-full bg-good" />
            Live intelligence
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6">{children}</main>

      <footer className="mx-auto max-w-[1600px] px-4 pb-28 pt-6 sm:px-6">
        <p className="max-w-3xl font-display text-sm leading-relaxed text-muted-foreground">
          Infrastructure is not what civilisation owns. Infrastructure is what civilisation becomes
          capable of doing.
        </p>
      </footer>

      <button
        onClick={() => setOpen(true)}
        className="label-xs fixed bottom-6 right-6 z-40 rounded-full bg-accent px-5 py-3.5 text-accent-foreground shadow-[0_0_40px_-8px_var(--accent)] transition-transform hover:scale-105"
      >
        WHAT IF?
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 p-4 backdrop-blur-md sm:items-center">
          <div className="animate-rise panel w-full max-w-3xl rounded-lg p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="label-xs text-accent">The what-if engine</div>
                <h3 className="mt-1 font-display text-xl tracking-tight">
                  What future do we want to make possible?
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Atlas translates the question into assumptions, systems affected, infrastructure
                  requirements, opportunities, risks, capital and measurable outcomes.
                </p>
              </div>
              <button onClick={() => setOpen(false)} className="label-xs px-2 py-1 hover:text-foreground">
                CLOSE
              </button>
            </div>
            <div className="mt-4">
              <AtlasCopilot
                mode="whatif"
                placeholder="What if every African city had abundant clean energy?"
                suggestions={[
                  "What if data centres became energy anchors rather than energy parasites?",
                  "What if rivers were treated as infrastructure?",
                  "What if housing generated food and energy?",
                  "What if infrastructure investment optimised human flourishing rather than GDP alone?",
                ]}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
