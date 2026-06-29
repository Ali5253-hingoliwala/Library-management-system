import { BookOpen, LayoutDashboard, Users, ArrowLeftRight, CalendarDays, ChevronLeft, ChevronRight, Library, User, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { AuthSession } from "../../types/auth";

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  canManage: boolean;
  session: AuthSession;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, adminOnly: true },
  { id: "books", label: "Books", icon: BookOpen, adminOnly: false },
  { id: "members", label: "Members", icon: Users, adminOnly: true },
  { id: "borrowing", label: "Borrowing", icon: ArrowLeftRight, adminOnly: false },
  { id: "events", label: "Events", icon: CalendarDays, adminOnly: false },
  { id: "payments", label: "Payments", icon: CreditCard, adminOnly: false },
  { id: "profile", label: "Profile", icon: User, adminOnly: false },
];

const roleColors: Record<string, string> = {
  admin: "bg-red-500/20 text-red-300",
  librarian: "bg-accent/20 text-accent",
  staff: "bg-blue-500/20 text-blue-300",
  user: "bg-green-500/20 text-green-300",
};

export default function Sidebar({ currentPage, onNavigate, isOpen, onToggle, canManage, session }: SidebarProps) {
  const visibleItems = navItems.filter((item) => canManage || !item.adminOnly);

  return (
    <motion.aside
      animate={{ width: isOpen ? 240 : 72 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative flex flex-col h-full bg-primary text-primary-foreground overflow-hidden shrink-0"
      style={{ fontFamily: "var(--font-body)" }}
    >
      <div className="flex items-center h-16 px-4 border-b border-sidebar-border shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center shrink-0">
            <Library size={18} className="text-white" />
          </div>
          <AnimatePresence>
            {isOpen && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                <p className="text-sm font-semibold leading-tight text-primary-foreground whitespace-nowrap">Bibliotheca</p>
                <p className="text-xs text-primary-foreground/50 whitespace-nowrap">Library System</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {visibleItems.map(({ id, label, icon: Icon }) => {
          const active = currentPage === id;
          return (
            <button key={id} onClick={() => onNavigate(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 group relative
                ${active ? "bg-accent text-white shadow-sm" : "text-primary-foreground/70 hover:bg-sidebar-accent hover:text-primary-foreground"}`}>
              <Icon size={18} className="shrink-0" />
              <AnimatePresence>
                {isOpen && (
                  <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.18 }} className="whitespace-nowrap overflow-hidden">
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
              {!isOpen && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity duration-150">{label}</div>
              )}
            </button>
          );
        })}
      </nav>

      {/* User info at bottom */}
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-3 py-3 border-t border-sidebar-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-accent/30 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-accent-foreground">{session.user.name.charAt(0).toUpperCase()}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-primary-foreground truncate">{session.user.name}</p>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${roleColors[session.user.role] ?? roleColors.user}`}>
                  {session.user.role}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-2 border-t border-sidebar-border">
        <button onClick={onToggle} className="w-full flex items-center justify-center p-2 rounded-md text-primary-foreground/60 hover:text-primary-foreground hover:bg-sidebar-accent transition-colors duration-150" aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}>
          {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>
    </motion.aside>
  );
}
