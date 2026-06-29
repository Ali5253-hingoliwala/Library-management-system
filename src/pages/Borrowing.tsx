import { useEffect, useState } from "react";
import { ArrowLeftRight, BookOpen, RotateCcw, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import Badge from "../components/ui/Badge";
import { approveBorrowingRequest, createBorrowing, fetchBooks, fetchBorrowing, fetchMembers, payFine, requestBook, returnBorrowing } from "../lib/api";
import type { Book, BorrowingRecord, Member } from "../types";
import type { AuthSession } from "../types/auth";

export default function Borrowing({ canManage, session }: { canManage: boolean; session: AuthSession }) {
  const [records, setRecords] = useState<BorrowingRecord[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [bookId, setBookId] = useState("");
  const [memberId, setMemberId] = useState("");
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState("");

  async function load() {
    try {
      setError("");
      const [nextRecords, nextBooks] = await Promise.all([fetchBorrowing(session, !canManage), fetchBooks(session)]);
      setRecords(nextRecords);
      setBooks(nextBooks);
      if (canManage) setMembers(await fetchMembers(session));
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not load borrowing data"); }
  }

  useEffect(() => { void load(); }, [canManage, session.accessToken]);

  async function submitLoan(event: React.FormEvent) {
    event.preventDefault(); setSaving(true);
    try {
      if (canManage) await createBorrowing(session, { bookId, memberId, dueDate });
      else await requestBook(session, bookId);
      setBookId(""); setMemberId("");
      await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Request failed"); }
    finally { setSaving(false); }
  }

  async function returnLoan(id: string) {
    try { await returnBorrowing(session, id); await load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Return failed"); }
  }

  async function approveRequest(id: string) {
    try { await approveBorrowingRequest(session, id); await load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not approve"); }
  }

  async function submitPayment(id: string) {
    const amount = parseFloat(payAmount);
    if (!amount || amount <= 0) return;
    try { await payFine(session, id, amount); setPayingId(null); setPayAmount(""); await load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Payment failed"); }
  }

  const availableBooks = books.filter((b) => b.availableCopies > 0);
  const overdueRecords = records.filter(r => r.status === "overdue");
  const requestedRecords = records.filter(r => (r.status as string) === "requested");
  const activeRecords = records.filter(r => r.status === "active");

  const statusBadge = (status: string) => {
    const map: Record<string, "danger" | "default" | "info" | "warning"> = {
      overdue: "danger", returned: "default", active: "info", requested: "warning"
    };
    return <Badge variant={map[status] ?? "default"}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{canManage ? "Borrowing Management" : "My Borrowing"}</h2>
        <p className="text-sm text-muted-foreground">{canManage ? "Issue, approve and return books" : "Request a book and track your loans"}</p>
      </div>

      {error && <div className="rounded-md border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-400">{error}</div>}

      {/* Summary cards for admin */}
      {canManage && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Active", count: activeRecords.length, icon: BookOpen, color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20" },
            { label: "Overdue", count: overdueRecords.length, icon: AlertTriangle, color: "text-red-600 bg-red-50 dark:bg-red-900/20" },
            { label: "Requests", count: requestedRecords.length, icon: Clock, color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20" },
            { label: "Total Fines", count: `$${records.reduce((s, r) => s + Math.max(0, (r.fine || 0) - (r.paidFine || 0)), 0).toFixed(2)}`, icon: ArrowLeftRight, color: "text-green-600 bg-green-50 dark:bg-green-900/20" },
          ].map(({ label, count, icon: Icon, color }) => (
            <div key={label} className={`rounded-xl border border-border bg-card p-3 flex items-center gap-3`}>
              <div className={`p-2 rounded-lg ${color}`}><Icon size={16} /></div>
              <div><p className="text-xs text-muted-foreground">{label}</p><p className="font-bold text-foreground">{count}</p></div>
            </div>
          ))}
        </div>
      )}

      {/* Issue / Request form */}
      <form onSubmit={submitLoan} className="flex flex-wrap items-end gap-3 border rounded-xl border-border bg-card p-4">
        <h3 className="w-full text-sm font-semibold text-foreground">{canManage ? "Issue a Book" : "Request a Book"}</h3>
        <label className="min-w-56 flex-1 text-xs text-muted-foreground">Book
          <select required value={bookId} onChange={(e) => setBookId(e.target.value)} className="mt-1 w-full rounded-md border border-border bg-input-background px-3 py-2 text-sm text-foreground">
            <option value="">Select an available book</option>
            {availableBooks.map((book) => <option key={book.id} value={book.id}>{book.title} ({book.availableCopies} left)</option>)}
          </select>
        </label>
        {canManage && <>
          <label className="min-w-52 flex-1 text-xs text-muted-foreground">Member
            <select required value={memberId} onChange={(e) => setMemberId(e.target.value)} className="mt-1 w-full rounded-md border border-border bg-input-background px-3 py-2 text-sm text-foreground">
              <option value="">Select member</option>
              {members.filter((m) => m.status === "active").map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </label>
          <label className="text-xs text-muted-foreground">Due date
            <input required type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="mt-1 block rounded-md border border-border bg-input-background px-3 py-2 text-sm text-foreground" />
          </label>
        </>}
        <button disabled={saving} className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-60 hover:bg-accent/90 transition-colors">
          {canManage ? <ArrowLeftRight size={15} /> : <BookOpen size={15} />}
          {saving ? "Saving..." : canManage ? "Issue Book" : "Request Book"}
        </button>
      </form>

      {/* Pending requests for admin */}
      {canManage && requestedRecords.length > 0 && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10 p-4">
          <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-300 mb-3 flex items-center gap-2"><Clock size={15} /> Pending Book Requests ({requestedRecords.length})</h3>
          <div className="space-y-2">
            {requestedRecords.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-2 bg-white dark:bg-card rounded-lg border border-amber-100 dark:border-amber-800">
                <div>
                  <p className="text-sm font-medium text-foreground">{r.bookTitle}</p>
                  <p className="text-xs text-muted-foreground">Requested by: {r.memberName}</p>
                </div>
                <button onClick={() => approveRequest(r.id)} className="inline-flex items-center gap-1 rounded-md bg-green-600 text-white px-3 py-1.5 text-xs font-medium hover:bg-green-700 transition-colors">
                  <CheckCircle size={12} /> Approve
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Records table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide" style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}>
              <th className="p-3">Book</th>
              {canManage && <th className="p-3">Member</th>}
              <th className="p-3">Borrowed</th>
              <th className="p-3">Due</th>
              <th className="p-3">Status</th>
              <th className="p-3">Fine</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {records.map((record) => {
              const outstanding = Math.max(0, (record.fine || 0) - (record.paidFine || 0));
              return (
                <tr key={record.id} className="hover:bg-secondary/50 transition-colors">
                  <td className="p-3 font-medium text-foreground">{record.bookTitle}</td>
                  {canManage && <td className="p-3 text-muted-foreground">{record.memberName}</td>}
                  <td className="p-3 text-muted-foreground text-xs">{record.borrowDate}</td>
                  <td className="p-3 text-xs" style={{ color: record.status === "overdue" ? "var(--destructive)" : "var(--muted-foreground)" }}>{record.dueDate}</td>
                  <td className="p-3">{statusBadge(record.status)}</td>
                  <td className="p-3 text-xs">
                    {outstanding > 0 ? (
                      <span className="text-red-600 dark:text-red-400 font-semibold">${outstanding.toFixed(2)}</span>
                    ) : record.status === "overdue" ? (
                      <span className="text-green-600 dark:text-green-400 text-xs">Paid</span>
                    ) : "-"}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {canManage && record.status !== "returned" && (record.status as string) !== "requested" && (
                        <button onClick={() => returnLoan(record.id)} className="inline-flex items-center gap-1 text-accent hover:underline text-xs"><RotateCcw size={12} /> Return</button>
                      )}
                      {outstanding > 0 && (
                        payingId === record.id ? (
                          <div className="flex items-center gap-1">
                            <input type="number" step="0.01" min="0.01" max={outstanding} value={payAmount} onChange={(e) => setPayAmount(e.target.value)} placeholder="Amount" className="w-20 rounded border border-border bg-input-background px-2 py-1 text-xs text-foreground" />
                            <button onClick={() => submitPayment(record.id)} className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700">Pay</button>
                            <button onClick={() => { setPayingId(null); setPayAmount(""); }} className="text-xs text-muted-foreground hover:text-foreground">✕</button>
                          </div>
                        ) : (
                          <button onClick={() => { setPayingId(record.id); setPayAmount(""); }} className="text-xs text-amber-600 dark:text-amber-400 hover:underline">Pay Fine</button>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {!records.length && (
              <tr><td colSpan={canManage ? 7 : 6} className="p-8 text-center text-muted-foreground">No borrowing records yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
