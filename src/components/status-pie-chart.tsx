import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { ApplicationStatus } from "@/lib/applications-api";

const COLORS: Record<ApplicationStatus, string> = {
  Applied: "#3b82f6",
  Interview: "#f59e0b",
  Offer: "#10b981",
  Rejected: "#ef4444",
};

export function StatusPieChart({
  counts,
}: {
  counts: Record<ApplicationStatus, number>;
}) {
  const data = (Object.keys(counts) as ApplicationStatus[])
    .map((k) => ({ name: k, value: counts[k] }))
    .filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
        No data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={2}
          stroke="hsl(var(--background))"
        >
          {data.map((d) => (
            <Cell key={d.name} fill={COLORS[d.name as ApplicationStatus]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            color: "var(--popover-foreground)",
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
