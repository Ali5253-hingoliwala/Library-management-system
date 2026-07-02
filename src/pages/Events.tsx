import { useEffect, useRef, useState } from "react";
import { CalendarDays, Clock, Edit2, MapPin, Plus, Users, Trash2 } from "lucide-react";
import Badge from "../components/ui/Badge";
import { fetchEvents, registerForEvent, saveEvent as persistEvent, deleteEvent } from "../lib/api";
import type { LibraryEvent } from "../types";
import type { AuthSession } from "../types/auth";

type EventForm = Omit<LibraryEvent, "id" | "registered" | "isUpcoming">;

const emptyForm: EventForm = {
  title: "", description: "",
  date: new Date().toISOString().slice(0, 10),
  time: "10:00 AM", location: "", type: "reading", capacity: 25,
};

const STORAGE_KEY = "lib_registered_events";

function loadRegistered(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch { return new Set(); }
}

function saveRegistered(set: Set<string>) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...set])); } catch {}
}

export default function Events({ canManage, session }: { canManage: boolean; session: AuthSession }) {
  const [events, setEvents] = useState<LibraryEvent[]>([]);
  const registeredRef = useRef<Set<string>>(loadRegistered());
  const [, forceUpdate] = useState(0);
  const [editing, setEditing] = useState<LibraryEvent | null>(null);
  const [form, setForm] = useState<EventForm>({ ...emptyForm });
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LibraryEvent | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    try { setEvents(await fetchEvents()); setError(""); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not load events"); }
  }

  useEffect(() => { void load(); }, []);

  function openAdd() { setEditing(null); setForm({ ...emptyForm }); setModalOpen(true); }
  function openEdit(event: LibraryEvent) {
    setEditing(event);
    const { id: _id, registered: _r, isUpcoming: _u, ...values } = event;
    setForm(values); setModalOpen(true);
  }
  function closeModal() { setEditing(null); setForm({ ...emptyForm }); setModalOpen(false); }

  async function saveEvent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try { await persistEvent(session, { ...form, capacity: Number(form.capacity) }, editing?.id); closeModal(); await load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not save event"); }
  }

  async function registerInterest(event: LibraryEvent) {
    if (registeredRef.current.has(event.id) || event.registered >= event.capacity) return;
    try {
      await registerForEvent(session, event.id);
      registeredRef.current.add(event.id);
      saveRegistered(registeredRef.current);   // ← persist to localStorage
      forceUpdate(n => n + 1);
      await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not register"); }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await deleteEvent(session, deleteTarget.id); setEvents(cur => cur.filter(e => e.id !== deleteTarget.id)); setDeleteTarget(null); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not delete"); setDeleteTarget(null); }
    finally { setDeleting(false); }
  }

  const typeColors: Record<string, string> = {
    workshop:   "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    reading:    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    exhibition: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    lecture:    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    children:   "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  };

  return (
    <div className="p-6 flex flex-col gap-6 h-full overflow-y-auto" style={{ fontFamily: "var(--font-body)" }}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground" style={{ fontFamily: "var(--font-display)" }}>Events & Programs</h2>
          <p className="text-sm text-muted-foreground">{events.length} upcoming events</p>
        </div>
        {canManage ? (
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-accent text-white text-sm font-medium rounded-md hover:bg-accent/90 transition-colors">
            <Plus size={15} /> Add Event
          </button>
        ) : <Badge>View only</Badge>}
      </div>

      {error && <div className="rounded-md border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-400">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => {
          const isRegistered = registeredRef.current.has(event.id);
          const full = event.registered >= event.capacity;
          const pct = Math.min(100, Math.round((event.registered / event.capacity) * 100));

          return (
            <div key={event.id} className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{event.title}</h3>
                  <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-1 ${typeColors[event.type] ?? "bg-muted text-muted-foreground"}`}>
                    {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                  </span>
                </div>
                {canManage && (
                  <div className="flex gap-1.5 items-center shrink-0">
                    <button onClick={() => openEdit(event)} className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground shrink-0">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => setDeleteTarget(event)} className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-red-600 hover:text-red-700 shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2">{event.description}</p>

              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5"><CalendarDays size={12} /> {event.date}</div>
                <div className="flex items-center gap-1.5"><Clock size={12} /> {event.time}</div>
                <div className="flex items-center gap-1.5"><MapPin size={12} /> {event.location}</div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span className="flex items-center gap-1"><Users size={11} /> {event.registered}/{event.capacity}</span>
                  <span>{pct}% full</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>

              {!canManage && (
                <button
                  onClick={() => registerInterest(event)}
                  disabled={isRegistered || full}
                  className={`w-full py-2 rounded-md text-sm font-medium transition-colors ${
                    isRegistered
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 cursor-default"
                      : full
                        ? "bg-muted text-muted-foreground cursor-not-allowed"
                        : "bg-accent text-white hover:bg-accent/90"
                  }`}
                >
                  {isRegistered ? "✓ Registered" : full ? "Full" : "Register Interest"}
                </button>
              )}
            </div>
          );
        })}
        {!events.length && (
          <div className="col-span-full py-16 text-center text-muted-foreground">
            <CalendarDays size={32} className="mx-auto mb-3 opacity-30" />
            <p>No events added yet.</p>
          </div>
        )}
      </div>

      {canManage && modalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4">
          <form onSubmit={saveEvent} className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-xl">
            <h3 className="mb-4 text-base font-semibold text-foreground">{editing ? "Edit Event" : "Add Event"}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Event title" className="col-span-full rounded-md border border-border bg-input-background px-3 py-2 text-sm text-foreground" />
              <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={3} className="col-span-full rounded-md border border-border bg-input-background px-3 py-2 text-sm text-foreground resize-none" />
              <input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="rounded-md border border-border bg-input-background px-3 py-2 text-sm text-foreground" />
              <input required value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} placeholder="Time (e.g. 10:00 AM)" className="rounded-md border border-border bg-input-background px-3 py-2 text-sm text-foreground" />
              <input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location" className="rounded-md border border-border bg-input-background px-3 py-2 text-sm text-foreground" />
              <input required type="number" min={1} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} placeholder="Capacity" className="rounded-md border border-border bg-input-background px-3 py-2 text-sm text-foreground" />
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as LibraryEvent["type"] })} className="rounded-md border border-border bg-input-background px-3 py-2 text-sm text-foreground">
                <option value="reading">Reading</option>
                <option value="workshop">Workshop</option>
                <option value="exhibition">Exhibition</option>
                <option value="lecture">Lecture</option>
                <option value="children">Children</option>
              </select>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={closeModal} className="rounded-md border border-border px-4 py-2 text-sm hover:bg-secondary text-foreground">Cancel</button>
              <button className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90">{editing ? "Update" : "Create"}</button>
            </div>
          </form>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-sm rounded-2xl p-6 shadow-2xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(239,68,68,0.12)" }}><Trash2 size={22} style={{ color: "#ef4444" }} /></div>
            <h3 className="text-base font-bold text-center text-foreground mb-1">Delete Event?</h3>
            <p className="text-sm text-center text-muted-foreground mb-5">Are you sure you want to delete <strong className="text-foreground">"{deleteTarget.title}"</strong>? This cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 rounded-lg py-2.5 text-sm font-medium" style={{ border: "1px solid var(--border)", color: "var(--foreground)", background: "transparent" }}>Cancel</button>
              <button onClick={confirmDelete} disabled={deleting} className="flex-1 rounded-lg py-2.5 text-sm font-semibold text-white disabled:opacity-60" style={{ background: "#ef4444" }}>{deleting ? "Deleting..." : "Delete"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
