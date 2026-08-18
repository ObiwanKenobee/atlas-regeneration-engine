import { SEVEN_CAPITALS, type CapitalId } from "@/lib/atlas/data";

export function CapitalsRadar({
  values,
  compare,
  size = 260,
}: {
  values: Record<CapitalId, number>;
  compare?: Record<CapitalId, number>;
  size?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 48;
  const n = SEVEN_CAPITALS.length;

  const point = (i: number, v: number) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    const rad = (Math.max(0, Math.min(100, v)) / 100) * r;
    return [cx + Math.cos(a) * rad, cy + Math.sin(a) * rad] as const;
  };

  const poly = (vals: Record<CapitalId, number>) =>
    SEVEN_CAPITALS.map((c, i) => point(i, vals[c.id]).join(",")).join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto max-w-full">
      {[25, 50, 75, 100].map((ring) => (
        <polygon
          key={ring}
          points={SEVEN_CAPITALS.map((_, i) => point(i, ring).join(",")).join(" ")}
          fill="none"
          stroke="var(--border)"
          strokeWidth="1"
        />
      ))}
      {SEVEN_CAPITALS.map((c, i) => {
        const [x, y] = point(i, 100);
        return <line key={c.id} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--border)" strokeWidth="1" />;
      })}
      {compare && (
        <polygon points={poly(compare)} fill="var(--muted-foreground)" fillOpacity="0.12" stroke="var(--muted-foreground)" strokeWidth="1" strokeDasharray="3 3" />
      )}
      <polygon
        points={poly(values)}
        fill="var(--primary)"
        fillOpacity="0.18"
        stroke="var(--primary)"
        strokeWidth="1.5"
        style={{ filter: "drop-shadow(0 0 8px oklch(0.82 0.13 195 / 0.5))" }}
      />
      {SEVEN_CAPITALS.map((c, i) => {
        const [x, y] = point(i, 100);
        const [px, py] = point(i, values[c.id]);
        const lx = cx + (x - cx) * 1.14;
        const ly = cy + (y - cy) * 1.14;
        return (
          <g key={`l-${c.id}`}>
            <circle cx={px} cy={py} r="2.5" fill="var(--primary)" />
            <text
              x={lx}
              y={ly}
              textAnchor={Math.abs(lx - cx) < 6 ? "middle" : lx > cx ? "start" : "end"}
              dominantBaseline="middle"
              fontSize="9"
              fill="var(--muted-foreground)"
              style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.12em" }}
            >
              {c.label.toUpperCase()}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
