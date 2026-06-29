import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { borrowingTrendData } from "../../data/mockData";

export default function BorrowingTrendChart() {
  return (
    <div className="bg-card rounded-xl border border-border p-5" style={{ fontFamily: "var(--font-body)" }}>
      <div className="mb-4">
        <h3 className="text-base font-semibold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
          Borrowing Trends
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">Monthly borrowed vs. returned books</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={borrowingTrendData} barGap={4} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
            cursor={{ fill: "var(--muted)", opacity: 0.5 }}
          />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="borrowed" name="Borrowed" fill="var(--accent)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="returned" name="Returned" fill="var(--primary)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
