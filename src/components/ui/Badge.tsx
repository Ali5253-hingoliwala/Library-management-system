interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "danger" | "info" | "default";
}

const variants = {
  success: "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/15 dark:text-green-300 dark:border-green-500/30",
  warning: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
  danger: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30",
  info: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-500/30",
  default: "bg-secondary text-secondary-foreground border-border",
};

export default function Badge({ children, variant = "default" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${variants[variant]}`}
      style={{ fontFamily: "var(--font-body)" }}
    >
      {children}
    </span>
  );
}
