import { Bell, LogOut, Search, Sun, Moon } from "lucide-react";
import { useState } from "react";
import type { AuthSession } from "../../types/auth";

interface NavbarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  isDark: boolean;
  onToggleDark: () => void;
  onOpenNotifications: () => void;
  session: AuthSession;
  onLogout: () => void;
  onNavigate: (page: string) => void;
  unreadCount?: number;
}

export default function Navbar({ isDark, onToggleDark, onOpenNotifications, session, onLogout, onNavigate, unreadCount = 0 }: NavbarProps) {
  const [search, setSearch] = useState("");

  return (
    <header className="h-16 flex items-center justify-between px-6 shrink-0" style={{ background: "var(--card)", borderBottom: "1px solid var(--border)", fontFamily: "var(--font-body)" }}>
      <div>
        <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>Bibliotheca</h1>
        <p className="text-xs text-muted-foreground">Library Management System</p>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative hidden sm:flex items-center">
          <Search size={14} className="absolute left-3 pointer-events-none" style={{ color: "var(--muted-foreground)" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search books, members..."
            className="pl-9 pr-4 py-1.5 text-sm rounded-lg focus:outline-none w-52 transition-all"
            style={{ background: "var(--input-background)", border: "1px solid var(--border)", color: "var(--foreground)" }} />
        </div>

        <button onClick={onToggleDark} className="p-2 rounded-lg transition-colors hover:bg-secondary" style={{ color: "var(--muted-foreground)" }}>
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Bell with live badge */}
        <button onClick={onOpenNotifications} className="relative p-2 rounded-lg transition-colors hover:bg-secondary" style={{ color: "var(--muted-foreground)" }}>
          <Bell size={17} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
              style={{ background: "var(--accent)" }}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        <div className="flex items-center gap-2 pl-3" style={{ borderLeft: "1px solid var(--border)" }}>
          <button onClick={() => onNavigate("profile")}
            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors"
            style={{ background: "rgba(200,132,58,0.15)", color: "var(--accent)" }}
            title="My Profile">
            {session.user.name.charAt(0).toUpperCase()}
          </button>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-foreground leading-tight">{session.user.name}</p>
            <p className="text-xs capitalize" style={{ color: "var(--muted-foreground)" }}>{session.user.role}</p>
          </div>
          <button onClick={onLogout} className="p-2 rounded-lg transition-colors hover:bg-secondary" style={{ color: "var(--muted-foreground)" }} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
