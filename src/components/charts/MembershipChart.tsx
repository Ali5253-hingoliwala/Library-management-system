import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { membershipData } from "../../data/mockData";

export default function MembershipChart() {
  return (
    <div className="bg-card rounded-xl border border-border p-5" style={{ fontFamily: "var(--font-body)" }}>
      <div className="mb-4">
        <h3 className="text-base font-semibold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
          Membership Growth
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">Total active members over 6 months</p>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={membershipData}>
          <defs>
            <linearGradient id="memberGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.18} />
              <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
          <Tooltip
            contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
          />
          <Area type="monotone" dataKey="total" name="Members" stroke="var(--accent)" strokeWidth={2} fill="url(#memberGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
