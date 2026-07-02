import { useEffect, useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import NotificationBar, { NotificationTicker } from "../components/layout/NotificationBar";
import AuthPage from "../pages/AuthPage";
import { clearSession, loadSession, saveSession } from "../lib/auth";
import type { AuthSession } from "../types/auth";

type Page = "dashboard" | "books" | "members" | "borrowing" | "events" | "profile" | "payments";

// Lazy imports — pages only mount when navigated to
import Dashboard from "../pages/Dashboard";
import Books from "../pages/Books";
import Members from "../pages/Members";
import Borrowing from "../pages/Borrowing";
import Events from "../pages/Events";
import Profile from "../pages/Profile";
import Payments from "../pages/Payments";

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDark, setIsDark] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(() => loadSession());
  const canManage = session?.user.role === "admin" || session?.user.role === "librarian";

  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDark(prefersDark);
    document.documentElement.classList.toggle("dark", prefersDark);
  }, []);

  const handleToggleDark = () => {
    setIsDark(d => { document.documentElement.classList.toggle("dark", !d); return !d; });
  };

  const handleAuthenticated = (nextSession: AuthSession) => {
    saveSession(nextSession);
    setSession(nextSession);
    setPage(nextSession.user.role === "user" ? "books" : "dashboard");
  };

  const handleLogout = () => { clearSession(); setSession(null); setPage("dashboard"); };

  useEffect(() => {
    if (session && !canManage && (page === "dashboard" || page === "members")) setPage("books");
  }, [canManage, page, session]);

  if (!session) {
    return <AuthPage onAuthenticated={handleAuthenticated} isDark={isDark} onToggleDark={handleToggleDark} />;
  }

  // Render ONLY the active page — prevents all useEffects from firing at once
  function renderPage() {
    switch (page) {
      case "dashboard": return <Dashboard canManage={canManage} session={session!} />;
      case "books":     return <Books     canManage={canManage} session={session!} />;
      case "members":   return <Members   canManage={canManage} session={session!} />;
      case "borrowing": return <Borrowing canManage={canManage} session={session!} />;
      case "events":    return <Events    canManage={canManage} session={session!} />;
      case "profile":   return <Profile   session={session!} onSessionUpdate={s => { saveSession(s); setSession(s); }} />;
      case "payments":  return <Payments  canManage={canManage} session={session!} />;
      default:          return <Books     canManage={canManage} session={session!} />;
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background" style={{ fontFamily: "var(--font-body)" }}>
      <Sidebar currentPage={page} onNavigate={p => setPage(p as Page)} isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(o => !o)} canManage={canManage} session={session} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(o => !o)}
          onToggleDark={handleToggleDark} isDark={isDark}
          onOpenNotifications={() => setNotifPanelOpen(o => !o)}
          onLogout={handleLogout} session={session}
          onNavigate={p => setPage(p as Page)}
          unreadCount={unreadCount} />
        <NotificationTicker session={session} />
        <main className="flex-1 overflow-hidden">{renderPage()}</main>
      </div>
      <NotificationBar isOpen={notifPanelOpen} onClose={() => setNotifPanelOpen(false)}
        session={session} onUnreadChange={setUnreadCount} />
    </div>
  );
}