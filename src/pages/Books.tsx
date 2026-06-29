import { useEffect, useState } from "react";
import { BookOpen, Edit2, Plus, Search, Send, User, Calendar, Layers, LayoutGrid, List, Filter, X } from "lucide-react";
import { fetchBooks, requestBook, saveBook as persistBook } from "../lib/api";
import type { Book } from "../types";
import type { AuthSession } from "../types/auth";

type BookForm = Omit<Book, "id" | "addedDate">;

const emptyForm: BookForm = {
  title: "", author: "", isbn: "", genre: "",
  publishedYear: new Date().getFullYear(),
  totalCopies: 1, availableCopies: 1, status: "available",
};

const STATUS_CONFIG = {
  available: { label: "Available", dot: "#10b981", bg: "rgba(16,185,129,0.12)", color: "#10b981" },
  borrowed:  { label: "Borrowed",  dot: "#f59e0b", bg: "rgba(245,158,11,0.12)",  color: "#f59e0b" },
  reserved:  { label: "Reserved",  dot: "#3b82f6", bg: "rgba(59,130,246,0.12)",  color: "#3b82f6" },
  damaged:   { label: "Damaged",   dot: "#ef4444", bg: "rgba(239,68,68,0.12)",   color: "#ef4444" },
};

const GENRE_PALETTE = [
  ["#a78bfa","rgba(167,139,250,0.12)"],["#34d399","rgba(52,211,153,0.12)"],
  ["#fb923c","rgba(251,146,60,0.12)"], ["#60a5fa","rgba(96,165,250,0.12)"],
  ["#f472b6","rgba(244,114,182,0.12)"],["#facc15","rgba(250,204,21,0.12)"],
  ["#2dd4bf","rgba(45,212,191,0.12)"], ["#c8843a","rgba(200,132,58,0.12)"],
];
const genreColorMap: Record<string, [string, string]> = {};
function genreColor(genre: string): [string, string] {
  if (!genreColorMap[genre]) {
    const idx = Object.keys(genreColorMap).length % GENRE_PALETTE.length;
    genreColorMap[genre] = GENRE_PALETTE[idx];
  }
  return genreColorMap[genre];
}

// Mini book-spine avatar
function BookSpine({ title, color }: { title: string; color: string }) {
  return (
    <div className="relative w-10 h-14 rounded-md flex items-center justify-center shrink-0 overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${color}33, ${color}11)`, border: `1.5px solid ${color}44` }}>
      <BookOpen size={16} style={{ color }} />
    </div>
  );
}

export default function Books({ canManage, session }: { canManage: boolean; session: AuthSession }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState("");
  const [filterGenre, setFilterGenre] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [editing, setEditing] = useState<Book | null>(null);
  const [form, setForm] = useState<BookForm>(emptyForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [requestedIds, setRequestedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");
  const [view, setView] = useState<"grid" | "table">("table");

  useEffect(() => {
    setLoading(true);
    fetchBooks(session)
      .then(setBooks)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load books"))
      .finally(() => setLoading(false));
  }, [session]);

  const genres = [...new Set(books.map(b => b.genre).filter(Boolean))];
  const filtered = books.filter((b) => {
    const q = search.toLowerCase();
    return (!q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.genre.toLowerCase().includes(q) || b.isbn.includes(q))
      && (!filterGenre || b.genre === filterGenre)
      && (!filterStatus || b.status === filterStatus);
  });

  function openAdd() { setEditing(null); setForm({ ...emptyForm }); setModalOpen(true); }
  function openEdit(book: Book) {
    setEditing(book);
    const { id: _id, addedDate: _d, ...values } = book;
    setForm(values); setModalOpen(true);
  }
  function closeModal() { setEditing(null); setForm({ ...emptyForm }); setModalOpen(false); setError(""); }

  async function saveBook(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSaving(true); setError("");
    const next: BookForm = { ...form, availableCopies: Math.min(Number(form.availableCopies), Number(form.totalCopies)), totalCopies: Number(form.totalCopies), publishedYear: Number(form.publishedYear) };
    try {
      const saved = await persistBook(session, next, editing?.id);
      setBooks((cur) => editing ? cur.map((b) => b.id === editing.id ? saved : b) : [saved, ...cur]);
      closeModal();
    } catch (err) { setError(err instanceof Error ? err.message : "Could not save book"); }
    finally { setSaving(false); }
  }

  async function handleRequest(book: Book) {
    if (requestedIds.has(book.id)) return;
    setRequestingId(book.id); setError("");
    try {
      await requestBook(session, book.id);
      setRequestedIds(s => new Set([...s, book.id]));
      setBooks((cur) => cur.map((item) => item.id === book.id ? { ...item, availableCopies: Math.max(0, item.availableCopies - 1), status: item.availableCopies - 1 <= 0 ? "borrowed" : "available" } : item));
    } catch (err) { setError(err instanceof Error ? err.message : "Could not request this book"); }
    finally { setRequestingId(null); }
  }

  const available = books.filter(b => b.status === "available").length;
  const borrowed  = books.filter(b => b.status === "borrowed").length;
  const hasFilters = !!(search || filterGenre || filterStatus);

  return (
    <div className="p-6 flex flex-col gap-5 h-full overflow-hidden" style={{ fontFamily: "var(--font-body)" }}>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>Book Catalog</h2>
          <div className="flex items-center gap-3 mt-1 text-xs">
            <span className="text-muted-foreground">{loading ? "Loading..." : `${books.length} titles in inventory`}</span>
            <span className="font-semibold" style={{ color: "#10b981" }}>● {available} available</span>
            <span className="font-semibold" style={{ color: "#f59e0b" }}>● {borrowed} borrowed</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button onClick={() => setView("table")} title="List view"
              className="px-3 py-2 transition-colors"
              style={{ background: view === "table" ? "var(--accent)" : "transparent", color: view === "table" ? "#fff" : "var(--muted-foreground)" }}>
              <List size={15} />
            </button>
            <button onClick={() => setView("grid")} title="Grid view"
              className="px-3 py-2 transition-colors"
              style={{ background: view === "grid" ? "var(--accent)" : "transparent", color: view === "grid" ? "#fff" : "var(--muted-foreground)" }}>
              <LayoutGrid size={15} />
            </button>
          </div>
          {canManage && (
            <button onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all shadow-sm hover:shadow-md hover:scale-[1.02]"
              style={{ background: "var(--accent)", color: "#fff" }}>
              <Plus size={15} /> Add Book
            </button>
          )}
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex items-center flex-1 min-w-52">
          <Search size={14} className="absolute left-3 pointer-events-none" style={{ color: "var(--muted-foreground)" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, author, ISBN, genre..."
            className="pl-9 pr-4 py-2 text-sm rounded-lg w-full focus:outline-none focus:ring-2"
            style={{ background: "var(--input-background)", border: "1px solid var(--border)", color: "var(--foreground)", focusRingColor: "var(--ring)" }} />
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs" style={{ border: "1px solid var(--border)", background: "var(--input-background)", color: "var(--muted-foreground)" }}>
          <Filter size={12} />
        </div>
        <select value={filterGenre} onChange={(e) => setFilterGenre(e.target.value)}
          className="text-sm rounded-lg px-3 py-2 focus:outline-none"
          style={{ background: "var(--input-background)", border: "1px solid var(--border)", color: "var(--foreground)" }}>
          <option value="">All Genres</option>
          {genres.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="text-sm rounded-lg px-3 py-2 focus:outline-none"
          style={{ background: "var(--input-background)", border: "1px solid var(--border)", color: "var(--foreground)" }}>
          <option value="">All Status</option>
          <option value="available">Available</option>
          <option value="borrowed">Borrowed</option>
          <option value="reserved">Reserved</option>
          <option value="damaged">Damaged</option>
        </select>
        {hasFilters && (
          <button onClick={() => { setSearch(""); setFilterGenre(""); setFilterStatus(""); }}
            className="flex items-center gap-1 text-xs px-2.5 py-2 rounded-lg transition-colors"
            style={{ color: "var(--muted-foreground)", border: "1px solid var(--border)", background: "var(--input-background)" }}>
            <X size={12} /> Clear
          </button>
        )}
        {hasFilters && (
          <span className="text-xs ml-1" style={{ color: "var(--muted-foreground)" }}>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
        )}
      </div>

      {error && (
        <div className="rounded-lg px-3 py-2 text-sm flex items-center gap-2"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444" }}>
          {error}
        </div>
      )}

      {/* ── TABLE VIEW ── */}
      {view === "table" && (
        <div className="flex-1 rounded-xl overflow-hidden flex flex-col" style={{ border: "1px solid var(--border)", background: "var(--card)" }}>
          <div className="overflow-auto flex-1">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ background: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
                  {[["Book", "auto"], ["ISBN", "150px"], ["Genre", "130px"], ["Year", "75px"], ["Copies", "90px"], ["Status", "120px"], ["", "100px"]].map(([h, w]) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest"
                      style={{ color: "var(--muted-foreground)", width: w, minWidth: w, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                      {[...Array(7)].map((_, j) => (
                        <td key={j} className="px-4 py-4">
                          <div className="h-4 rounded-md animate-pulse" style={{ background: "var(--muted)", width: j === 0 ? "75%" : "55%" }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center" style={{ color: "var(--muted-foreground)" }}>
                      <BookOpen size={36} className="mx-auto mb-3 opacity-20" />
                      <p className="font-medium">No books found</p>
                      {hasFilters && <p className="text-xs mt-1">Try adjusting your filters</p>}
                    </td>
                  </tr>
                ) : filtered.map((book) => {
                  const cfg = STATUS_CONFIG[book.status] ?? STATUS_CONFIG.available;
                  const [gc] = genreColor(book.genre);
                  const requested = requestedIds.has(book.id);
                  return (
                    <tr key={book.id} className="group transition-colors"
                      style={{ borderBottom: "1px solid var(--border)" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--secondary)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>

                      {/* Book + author */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <BookSpine title={book.title} color={gc} />
                          <div>
                            <p className="font-semibold leading-snug" style={{ color: "var(--foreground)" }}>{book.title}</p>
                            <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: "var(--muted-foreground)" }}>
                              <User size={10} /> {book.author}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* ISBN */}
                      <td className="px-4 py-3">
                        <code className="text-xs px-2 py-0.5 rounded-md" style={{ fontFamily: "var(--font-mono)", background: "var(--muted)", color: "var(--muted-foreground)" }}>
                          {book.isbn}
                        </code>
                      </td>

                      {/* Genre */}
                      <td className="px-4 py-3">
                        {(() => { const [c, bg] = genreColor(book.genre); return (
                          <span className="inline-block text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: bg, color: c }}>
                            {book.genre}
                          </span>
                        ); })()}
                      </td>

                      {/* Year */}
                      <td className="px-4 py-3">
                        <span className="text-xs flex items-center gap-1" style={{ color: "var(--muted-foreground)" }}>
                          <Calendar size={10} /> {book.publishedYear}
                        </span>
                      </td>

                      {/* Copies */}
                      <td className="px-4 py-3 text-center">
                        <div className="inline-flex items-center gap-0.5">
                          <span className="font-bold text-sm" style={{ color: book.availableCopies === 0 ? "#ef4444" : "#10b981" }}>
                            {book.availableCopies}
                          </span>
                          <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>/{book.totalCopies}</span>
                        </div>
                        {/* mini progress bar */}
                        <div className="mt-1 h-1 w-12 mx-auto rounded-full overflow-hidden" style={{ background: "var(--muted)" }}>
                          <div className="h-full rounded-full transition-all"
                            style={{ width: `${book.totalCopies ? (book.availableCopies / book.totalCopies) * 100 : 0}%`, background: book.availableCopies === 0 ? "#ef4444" : "#10b981" }} />
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold"
                          style={{ background: cfg.bg, color: cfg.color }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
                          {cfg.label}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3">
                        {canManage ? (
                          <button onClick={() => openEdit(book)}
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all hover:scale-[1.03]"
                            style={{ border: "1px solid var(--border)", color: "var(--foreground)", background: "var(--card)" }}>
                            <Edit2 size={12} /> Edit
                          </button>
                        ) : (
                          <button onClick={() => handleRequest(book)}
                            disabled={book.availableCopies < 1 || requestingId === book.id || requested}
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
                            style={requested
                              ? { background: "rgba(16,185,129,0.12)", color: "#10b981", cursor: "default" }
                              : book.availableCopies < 1
                                ? { background: "var(--muted)", color: "var(--muted-foreground)", opacity: 0.5, cursor: "not-allowed" }
                                : { background: "var(--accent)", color: "#fff" }}>
                            <Send size={12} />
                            {requested ? "Requested ✓" : requestingId === book.id ? "..." : "Request"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Footer */}
          <div className="px-4 py-2.5 flex items-center justify-between text-xs"
            style={{ borderTop: "1px solid var(--border)", color: "var(--muted-foreground)" }}>
            <span>Showing <strong style={{ color: "var(--foreground)" }}>{filtered.length}</strong> of {books.length} books</span>
            {hasFilters && <span style={{ color: "var(--accent)" }}>Filtered</span>}
          </div>
        </div>
      )}

      {/* ── GRID VIEW ── */}
      {view === "grid" && (
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-52 rounded-xl animate-pulse" style={{ background: "var(--muted)" }} />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((book) => {
                const cfg = STATUS_CONFIG[book.status] ?? STATUS_CONFIG.available;
                const [gc, gbg] = genreColor(book.genre);
                const requested = requestedIds.has(book.id);
                return (
                  <div key={book.id} className="rounded-xl flex flex-col gap-3 p-4 transition-all hover:shadow-lg hover:-translate-y-0.5"
                    style={{ border: "1px solid var(--border)", background: "var(--card)" }}>

                    {/* Top row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-11 h-16 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: `linear-gradient(135deg, ${gc}22, ${gc}08)`, border: `1.5px solid ${gc}33` }}>
                        <BookOpen size={18} style={{ color: gc }} />
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: cfg.bg, color: cfg.color }}>
                        {cfg.label}
                      </span>
                    </div>

                    {/* Title + author */}
                    <div className="flex-1">
                      <h3 className="font-bold text-sm leading-snug line-clamp-2" style={{ color: "var(--foreground)" }}>{book.title}</h3>
                      <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "var(--muted-foreground)" }}>
                        <User size={10} /> {book.author}
                      </p>
                    </div>

                    {/* Genre + year */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: gbg, color: gc }}>{book.genre}</span>
                      <span className="text-xs flex items-center gap-1" style={{ color: "var(--muted-foreground)" }}>
                        <Calendar size={10} /> {book.publishedYear}
                      </span>
                    </div>

                    {/* Copies bar */}
                    <div>
                      <div className="flex justify-between text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>
                        <span className="flex items-center gap-1"><Layers size={10} /> Copies</span>
                        <span><strong style={{ color: book.availableCopies === 0 ? "#ef4444" : "#10b981" }}>{book.availableCopies}</strong>/{book.totalCopies}</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--muted)" }}>
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${book.totalCopies ? (book.availableCopies / book.totalCopies) * 100 : 0}%`, background: book.availableCopies === 0 ? "#ef4444" : "#10b981" }} />
                      </div>
                    </div>

                    {/* Action */}
                    <div className="pt-1" style={{ borderTop: "1px solid var(--border)" }}>
                      {canManage ? (
                        <button onClick={() => openEdit(book)}
                          className="w-full flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-colors"
                          style={{ border: "1px solid var(--border)", color: "var(--foreground)", background: "var(--card)" }}>
                          <Edit2 size={12} /> Edit Book
                        </button>
                      ) : (
                        <button onClick={() => handleRequest(book)}
                          disabled={book.availableCopies < 1 || requestingId === book.id || requested}
                          className="w-full flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all"
                          style={requested
                            ? { background: "rgba(16,185,129,0.12)", color: "#10b981", cursor: "default" }
                            : book.availableCopies < 1
                              ? { background: "var(--muted)", color: "var(--muted-foreground)", opacity: 0.5, cursor: "not-allowed" }
                              : { background: "var(--accent)", color: "#fff" }}>
                          <Send size={12} />
                          {requested ? "Requested ✓" : requestingId === book.id ? "Requesting..." : "Request Book"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="col-span-full py-20 text-center" style={{ color: "var(--muted-foreground)" }}>
                  <BookOpen size={36} className="mx-auto mb-3 opacity-20" />
                  <p className="font-medium">No books found</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── MODAL ── */}
      {canManage && modalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <form onSubmit={saveBook} className="w-full max-w-xl rounded-2xl p-6 shadow-2xl"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(200,132,58,0.12)" }}>
                <BookOpen size={18} style={{ color: "var(--accent)" }} />
              </div>
              <div>
                <h3 className="text-base font-bold" style={{ color: "var(--foreground)" }}>{editing ? "Edit Book" : "Add New Book"}</h3>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{editing ? "Update book details" : "Fill in the book information"}</p>
              </div>
              <button type="button" onClick={closeModal} className="ml-auto p-1.5 rounded-lg transition-colors"
                style={{ color: "var(--muted-foreground)" }}><X size={16} /></button>
            </div>

            {error && (
              <div className="mb-3 text-sm px-3 py-2 rounded-lg flex items-center gap-2"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444" }}>
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: "title", label: "Title", type: "text", span: true },
                { key: "author", label: "Author", type: "text" },
                { key: "isbn", label: "ISBN", type: "text" },
                { key: "genre", label: "Genre", type: "text" },
                { key: "publishedYear", label: "Published Year", type: "number" },
              ].map(({ key, label, type, span }) => (
                <div key={key} className={span ? "sm:col-span-2" : ""}>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>{label}</label>
                  <input required type={type}
                    value={(form as any)[key]}
                    onChange={(e) => setForm({ ...form, [key]: type === "number" ? Number(e.target.value) : e.target.value })}
                    className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                    style={{ background: "var(--input-background)", border: "1px solid var(--border)", color: "var(--foreground)" }} />
                </div>
              ))}

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Book["status"] })}
                  className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                  style={{ background: "var(--input-background)", border: "1px solid var(--border)", color: "var(--foreground)" }}>
                  <option value="available">Available</option>
                  <option value="borrowed">Borrowed</option>
                  <option value="reserved">Reserved</option>
                  <option value="damaged">Damaged</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>Total Copies</label>
                <input required type="number" min={0} value={form.totalCopies}
                  onChange={(e) => setForm({ ...form, totalCopies: Number(e.target.value) })}
                  className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                  style={{ background: "var(--input-background)", border: "1px solid var(--border)", color: "var(--foreground)" }} />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>Available Copies</label>
                <input required type="number" min={0} value={form.availableCopies}
                  onChange={(e) => setForm({ ...form, availableCopies: Number(e.target.value) })}
                  className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                  style={{ background: "var(--input-background)", border: "1px solid var(--border)", color: "var(--foreground)" }} />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={closeModal}
                className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                style={{ border: "1px solid var(--border)", color: "var(--foreground)", background: "transparent" }}>
                Cancel
              </button>
              <button disabled={saving}
                className="rounded-lg px-5 py-2 text-sm font-semibold text-white transition-all disabled:opacity-60"
                style={{ background: "var(--accent)" }}>
                {saving ? "Saving..." : editing ? "Update Book" : "Add Book"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
