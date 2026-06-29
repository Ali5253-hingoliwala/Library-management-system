import { X, Bell, CalendarDays, BookOpen, AlertTriangle, Megaphone, RefreshCw, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Notification } from "../../types";
import type { AuthSession } from "../../types/auth";
import { fetchNotifications } from "../../lib/api";

interface NotificationBarProps {
  isOpen: boolean;
  onClose: () => void;
  session: AuthSession;
  onUnreadChange?: (count: number) => void;
}

const typeConfig = {
  event:        { icon: CalendarDays, color: "text-blue-600",  bg: "bg-blue-50 dark:bg-blue-900/20",   label: "Event",    dot: "#3b82f6" },
  overdue:      { icon: AlertTriangle, color: "text-red-600",   bg: "bg-red-50 dark:bg-red-900/20",     label: "Overdue",  dot: "#ef4444" },
  new_book:     { icon: BookOpen,      color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20", label: "New Book", dot: "#10b981" },
  announcement: { icon: Megaphone,     color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20", label: "Notice",   dot: "#f59e0b" },
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

const READ_KEY = "lib_read_notif_ids";
function loadReadIds(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(READ_KEY) ?? "[]")); } catch { return new Set(); }
}
function saveReadIds(ids: Set<string>) {
  try { localStorage.setItem(READ_KEY, JSON.stringify([...ids])); } catch {}
}

/* ── Ticker bar ── */
export function NotificationTicker({ session }: { session: AuthSession }) {
  const [notes, setNotes] = useState<Notification[]>([]);
  const [idx, setIdx] = useState(0);
  const readIds = useRef(loadReadIds());

  const load = useCallback(async () => {
    try {
      const data = await fetchNotifications(session);
      setNotes(data.filter(n => !readIds.current.has(n.id)));
    } catch {}
  }, [session.accessToken]);

  useEffect(() => { void load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, [load]);
  useEffect(() => {
    if (notes.length <= 1) return;
    const t = setInterval(() => setIdx(i => (i + 1) % notes.length), 4500);
    return () => clearInterval(t);
  }, [notes.length]);

  if (!notes.length) return null;
  const current = notes[idx % notes.length];
  const cfg = typeConfig[current.type];

  return (
    <div className="flex items-center gap-3 px-4 py-1.5 border-b" style={{ background: "var(--accent)", opacity: 0.92, borderColor: "var(--accent)" }}>
      <Bell size={13} className="text-white shrink-0" />
      <AnimatePresence mode="wait">
        <motion.span key={current.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }}
          className="text-white text-xs truncate flex-1">
          <span className="font-bold mr-1.5 uppercase tracking-wider text-white/70 text-[10px]">{cfg.label}</span>
          {current.message}
        </motion.span>
      </AnimatePresence>
      {notes.length > 1 && (
        <span className="text-white/70 text-xs shrink-0">{idx + 1}/{notes.length}</span>
      )}
    </div>
  );
}

/* ── Slide-in panel ── */
export default function NotificationBar({ isOpen, onClose, session, onUnreadChange }: NotificationBarProps) {
  const [notes, setNotes] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const readIds = useRef(loadReadIds());
  const panelRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await fetchNotifications(session);
      // merge persisted read state
      const merged = data.map(n => ({ ...n, read: readIds.current.has(n.id) ? true : n.read }));
      setNotes(merged);
      setLastUpdated(new Date());
      onUnreadChange?.(merged.filter(n => !n.read).length);
    } catch {}
    finally { if (!silent) setLoading(false); }
  }, [session.accessToken]);

  // Poll every 30s
  useEffect(() => {
    void load();
    const t = setInterval(() => load(true), 30000);
    return () => clearInterval(t);
  }, [load]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    };
    if (isOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  function markRead(id: string) {
    readIds.current.add(id);
    saveReadIds(readIds.current);
    setNotes(cur => cur.map(n => n.id === id ? { ...n, read: true } : n));
    onUnreadChange?.(notes.filter(n => !n.read && n.id !== id).length);
  }

  function markAllRead() {
    notes.forEach(n => readIds.current.add(n.id));
    saveReadIds(readIds.current);
    setNotes(cur => cur.map(n => ({ ...n, read: true })));
    onUnreadChange?.(0);
  }

  const unread = notes.filter(n => !n.read).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40" />
          <motion.div ref={panelRef}
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 h-full w-80 shadow-2xl z-50 flex flex-col"
            style={{ background: "var(--card)", fontFamily: "var(--font-body)" }}>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2">
                <Bell size={16} style={{ color: "var(--accent)" }} />
                <h2 className="font-semibold text-foreground" style={{ fontFamily: "var(--font-display)" }}>Notifications</h2>
                {unread > 0 && (
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: "var(--accent)" }}>{unread}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => load()} title="Refresh"
                  className="p-1.5 rounded-md transition-colors hover:bg-secondary text-muted-foreground hover:text-foreground">
                  <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                </button>
                {unread > 0 && (
                  <button onClick={markAllRead} title="Mark all read"
                    className="p-1.5 rounded-md transition-colors hover:bg-secondary text-muted-foreground hover:text-foreground">
                    <Check size={14} />
                  </button>
                )}
                <button onClick={onClose} className="p-1.5 rounded-md transition-colors hover:bg-secondary text-muted-foreground hover:text-foreground">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Last updated */}
            {lastUpdated && (
              <div className="px-5 py-1.5 text-xs" style={{ color: "var(--muted-foreground)", borderBottom: "1px solid var(--border)", background: "var(--muted)" }}>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" /> Live · updated {formatTime(lastUpdated.toISOString())}
                </span>
              </div>
            )}

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {loading && notes.length === 0 ? (
                <div className="p-8 text-center" style={{ color: "var(--muted-foreground)" }}>
                  <RefreshCw size={24} className="mx-auto mb-2 animate-spin opacity-40" />
                  <p className="text-sm">Loading notifications...</p>
                </div>
              ) : notes.length === 0 ? (
                <div className="p-8 text-center" style={{ color: "var(--muted-foreground)" }}>
                  <Bell size={28} className="mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                <div>
                  {notes.map((n) => {
                    const cfg = typeConfig[n.type];
                    const Icon = cfg.icon;
                    return (
                      <div key={n.id}
                        className="flex gap-3 p-4 cursor-pointer transition-colors"
                        style={{
                          borderBottom: "1px solid var(--border)",
                          background: n.read ? "transparent" : "var(--accent)" + "0d",
                          opacity: n.read ? 0.65 : 1,
                        }}
                        onClick={() => !n.read && markRead(n.id)}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${cfg.bg} ${cfg.color}`}>
                          <Icon size={14} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: cfg.dot }}>{cfg.label}</span>
                            {!n.read && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--accent)" }} />}
                          </div>
                          <p className="text-sm leading-snug" style={{ color: "var(--foreground)" }}>{n.message}</p>
                          <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>{formatTime(n.timestamp)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 text-xs flex items-center justify-between" style={{ borderTop: "1px solid var(--border)", color: "var(--muted-foreground)" }}>
              <span>{notes.length} total · {unread} unread</span>
              <span>Auto-refreshes every 30s</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
