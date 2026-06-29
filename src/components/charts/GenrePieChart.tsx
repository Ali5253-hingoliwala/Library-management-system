import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { genreDistributionData } from "../../data/mockData";

export default function GenrePieChart() {
  return (
    <div className="bg-card rounded-xl border border-border p-5" style={{ fontFamily: "var(--font-body)" }}>
      <div className="mb-4">
        <h3 className="text-base font-semibold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
          Genre Distribution
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">Books by category — 1,247 total</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={genreDistributionData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
          >
            {genreDistributionData.map((entry, i) => (
              <Cell key={i} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
            formatter={(value: number) => [value, "Books"]}
          />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
