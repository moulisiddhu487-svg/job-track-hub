import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import type { Application } from "@/lib/applications-api";

function startOfWeek(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = (day + 6) % 7; // Monday start
  date.setDate(date.getDate() - diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function fmt(d: Date) {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function WeeklyBarChart({ apps }: { apps: Application[] }) {
  const weeks: { label: string; count: number; key: number }[] = [];
  const now = startOfWeek(new Date());
  for (let i = 7; i >= 0; i--) {
    const w = new Date(now);
    w.setDate(w.getDate() - i * 7);
    weeks.push({ label: fmt(w), count: 0, key: w.getTime() });
  }
  const map = new Map(weeks.map((w) => [w.key, w]));
  apps.forEach((a) => {
    const k = startOfWeek(new Date(a.apply_date)).getTime();
    const w = map.get(k);
    if (w) w.count += 1;
  });

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={weeks} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="var(--muted-foreground)" fontSize={11} allowDecimals={false} tickLine={false} axisLine={false} />
        <Tooltip
          cursor={{ fill: "var(--muted)", opacity: 0.4 }}
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            color: "var(--popover-foreground)",
          }}
        />
        <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
