import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  accent?: boolean;
}

export default function StatCard({ title, value, subtitle, icon: Icon, trend, accent }: StatCardProps) {
  return (
    <div
      className={`rounded-xl p-5 flex flex-col gap-3 border transition-shadow hover:shadow-md ${
        accent ? "bg-primary text-primary-foreground border-primary" : "bg-card text-card-foreground border-border"
      }`}
      style={{ fontFamily: "var(--font-body)" }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-xs font-medium uppercase tracking-widest ${accent ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
            {title}
          </p>
          <p
            className="text-3xl font-semibold mt-1 leading-none"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {value}
          </p>
          {subtitle && (
            <p className={`text-xs mt-1 ${accent ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
              {subtitle}
            </p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accent ? "bg-white/10" : "bg-secondary"}`}>
          <Icon size={20} className={accent ? "text-primary-foreground" : "text-accent"} />
        </div>
      </div>

      {trend && (
        <div className={`flex items-center gap-1 text-xs font-medium ${trend.value >= 0 ? "text-green-600" : "text-red-500"}`}>
          <span>{trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}%</span>
          <span className={`font-normal ${accent ? "text-primary-foreground/50" : "text-muted-foreground"}`}>{trend.label}</span>
        </div>
      )}
    </div>
  );
}
