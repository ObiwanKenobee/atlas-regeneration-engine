import { useMemo } from "react";
import { ASSETS, PLACES, SYSTEM_BY_ID, type SystemId, type Place } from "@/lib/atlas/data";
import { rici, riciBand } from "@/lib/atlas/model";

const project = (lat: number, lon: number) => ({
  x: ((lon + 180) / 360) * 100,
  y: ((78 - lat) / 156) * 56,
});

export function WorldCanvas({
  activeSystems,
  selectedPlaceId,
  onSelectPlace,
  zoom = 1,
  showAssets = true,
  showLabels = true,
  className,
}: {
  activeSystems: SystemId[];
  selectedPlaceId?: string;
  onSelectPlace?: (p: Place) => void;
  zoom?: number;
  showAssets?: boolean;
  showLabels?: boolean;
  className?: string;
}) {
  const nodes = useMemo(
    () => PLACES.filter((p) => p.id !== "world").map((p) => ({ place: p, ...project(p.lat, p.lon) })),
    [],
  );
  const assets = useMemo(
    () =>
      ASSETS.filter((a) => activeSystems.length === 0 || activeSystems.includes(a.system)).map(
        (a) => ({ asset: a, ...project(a.lat, a.lon) }),
      ),
    [activeSystems],
  );

  const flows = useMemo(() => {
    const pairs: Array<[string, string]> = [
      ["nairobi", "kenya"],
      ["kenya", "east-africa"],
      ["east-africa", "africa"],
      ["west-kenya", "kenya"],
      ["africa", "india"],
      ["india", "nordics"],
      ["texas", "nordics"],
      ["lagos", "africa"],
      ["sao-paulo", "texas"],
    ];
    return pairs
      .map(([a, b]) => {
        const from = nodes.find((n) => n.place.id === a);
        const to = nodes.find((n) => n.place.id === b);
        return from && to ? { from, to, id: `${a}-${b}` } : null;
      })
      .filter(Boolean) as Array<{ from: (typeof nodes)[number]; to: (typeof nodes)[number]; id: string }>;
  }, [nodes]);

  const focus = selectedPlaceId ? nodes.find((n) => n.place.id === selectedPlaceId) : undefined;

  return (
    <div className={`relative overflow-hidden rounded-lg border border-border bg-background ${className ?? ""}`}>
      <div className="grid-texture pointer-events-none absolute inset-0 opacity-70" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 55% at 50% 50%, oklch(0.4 0.09 210 / 22%), transparent 70%)",
        }}
      />
      <svg
        viewBox="0 0 100 56"
        preserveAspectRatio="xMidYMid slice"
        className="relative h-full w-full"
      >
        <g
          transform={
            focus
              ? `translate(${(50 - focus.x * zoom).toFixed(2)} ${(28 - focus.y * zoom).toFixed(2)}) scale(${zoom})`
              : `translate(${(50 - 50 * zoom).toFixed(2)} ${(28 - 28 * zoom).toFixed(2)}) scale(${zoom})`
          }
          style={{ transition: "transform 700ms cubic-bezier(.2,.7,.3,1)" }}
        >
        <defs>
          <radialGradient id="node-glow">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* graticule */}
        {Array.from({ length: 11 }).map((_, i) => (
          <line
            key={`lat${i}`}
            x1="0"
            x2="100"
            y1={(i * 56) / 10}
            y2={(i * 56) / 10}
            stroke="var(--border)"
            strokeWidth="0.08"
          />
        ))}
        {Array.from({ length: 19 }).map((_, i) => (
          <line
            key={`lon${i}`}
            y1="0"
            y2="56"
            x1={(i * 100) / 18}
            x2={(i * 100) / 18}
            stroke="var(--border)"
            strokeWidth="0.08"
          />
        ))}
        <ellipse cx="50" cy="28" rx="46" ry="24" fill="none" stroke="var(--border)" strokeWidth="0.12" />
        <ellipse cx="50" cy="28" rx="30" ry="24" fill="none" stroke="var(--border)" strokeWidth="0.1" />

        {/* animated flows */}
        {flows.map((f) => {
          const mx = (f.from.x + f.to.x) / 2;
          const my = (f.from.y + f.to.y) / 2 - 6;
          return (
            <path
              key={f.id}
              d={`M ${f.from.x} ${f.from.y} Q ${mx} ${my} ${f.to.x} ${f.to.y}`}
              fill="none"
              stroke="var(--primary)"
              strokeOpacity="0.35"
              strokeWidth="0.14"
              strokeDasharray="1.2 2.4"
              style={{ animation: "atlas-dash 9s linear infinite" }}
            />
          );
        })}

        {/* asset markers */}
        {showAssets &&
          assets.map(({ asset, x, y }) => (
            <g key={asset.id}>
              <rect
                x={x - 0.5}
                y={y - 0.5}
                width="1"
                height="1"
                fill={SYSTEM_BY_ID[asset.system].colorVar}
                opacity="0.9"
              />
              <rect
                x={x - 1.2}
                y={y - 1.2}
                width="2.4"
                height="2.4"
                fill="none"
                stroke={SYSTEM_BY_ID[asset.system].colorVar}
                strokeWidth="0.1"
                opacity="0.5"
              />
            </g>
          ))}

        {/* place nodes */}
        {nodes.map(({ place, x, y }, idx) => {
          const labelDy = (idx % 2 === 0 ? 0.8 : -2.2) / zoom;
          const score = rici(place.indicators);
          const band = riciBand(score);
          const selected = place.id === selectedPlaceId;
          return (
            <g
              key={place.id}
              onClick={() => onSelectPlace?.(place)}
              className="cursor-pointer"
              role="button"
              aria-label={place.name}
            >
              <circle cx={x} cy={y} r={selected ? 6 : 4} fill="url(#node-glow)" />
              <circle
                cx={x}
                cy={y}
                r={selected ? 1.5 : 1}
                fill={band.color}
                style={{ filter: `drop-shadow(0 0 2px ${band.color})` }}
              />
              <circle
                cx={x}
                cy={y}
                r="2.2"
                fill="none"
                stroke={band.color}
                strokeWidth="0.12"
                opacity={selected ? 0.9 : 0.4}
                style={selected ? { animation: "atlas-pulse 2.4s ease-in-out infinite" } : undefined}
              />
              {showLabels && (
              <text
                x={x + 3 / zoom}
                y={y + labelDy}
                fontSize={1.7 / zoom}
                fill="var(--foreground)"
                opacity={selected ? 1 : 0.68}
                style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}
              >
                {place.name.toUpperCase()}
              </text>
              )}
              {showLabels && (
              <text
                x={x + 3 / zoom}
                y={y + labelDy + 2.2 / zoom}
                fontSize={1.3 / zoom}
                fill={band.color}
                opacity="0.85"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                RICI {score.toFixed(1)}
              </text>
              )}
            </g>
          );
        })}
        </g>
      </svg>

      <div className="pointer-events-none absolute bottom-3 left-4 flex flex-wrap gap-3">
        {activeSystems.map((s) => (
          <span key={s} className="label-xs flex items-center gap-1.5">
            <i className="size-1.5 rounded-full" style={{ background: SYSTEM_BY_ID[s].colorVar }} />
            {SYSTEM_BY_ID[s].label}
          </span>
        ))}
      </div>
      <div className="label-xs pointer-events-none absolute right-4 top-3">
        Equirectangular · WGS84 · node radius ∝ selection
      </div>
    </div>
  );
}
