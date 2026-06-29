import { useEffect, useState } from "react";
import { CreditCard, AlertTriangle, CheckCircle, DollarSign, TrendingUp } from "lucide-react";
import Badge from "../components/ui/Badge";
import { fetchBorrowing, payFine } from "../lib/api";
import type { BorrowingRecord } from "../types";
import type { AuthSession } from "../types/auth";

export default function Payments({ canManage, session }: { canManage: boolean; session: AuthSession }) {
  const [records, setRecords] = useState<BorrowingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payingId, setPayingId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    setLoading(true);
    try {
      const data = await fetchBorrowing(session, !canManage);
      setRecords(data);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load payment data");
    } finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, [canManage, session.accessToken]);

  async function submitPayment(id: string) {
    const amount = parseFloat(payAmount);
    if (!amount || amount <= 0) return;
    try {
      await payFine(session, id, amount);
      setSuccess("Payment recorded successfully!");
      setPayingId(null); setPayAmount("");
      await load();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
    }
  }

  const withFines = records.filter(r => (r.fine || 0) > 0);
  const totalFines = withFines.reduce((s, r) => s + (r.fine || 0), 0);
  const totalPaid = withFines.reduce((s, r) => s + (r.paidFine || 0), 0);
  const outstanding = totalFines - totalPaid;

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground" style={{ fontFamily: "var(--font-display)" }}>{canManage ? "Payment Management" : "My Fines & Payments"}</h2>
        <p className="text-sm text-muted-foreground">{canManage ? "Track and manage all member fines" : "View your outstanding fines and make payments"}</p>
      </div>

      {error && <div className="rounded-md border border-red-200 bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-400">{error}</div>}
      {success && <div className="rounded-md border border-green-200 bg-green-50 dark:bg-green-900/20 p-3 text-sm text-green-700 dark:text-green-400 flex items-center gap-2"><CheckCircle size={15} />{success}</div>}

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-1"><DollarSign size={16} className="text-muted-foreground" /><p className="text-xs text-muted-foreground">Total Fines</p></div>
          <p className="text-2xl font-bold text-foreground">${totalFines.toFixed(2)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-1"><CheckCircle size={16} className="text-green-500" /><p className="text-xs text-muted-foreground">Total Paid</p></div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">${totalPaid.toFixed(2)}</p>
        </div>
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 p-4 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2 mb-1"><AlertTriangle size={16} className="text-red-500" /><p className="text-xs text-red-500">Outstanding</p></div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">${outstanding.toFixed(2)}</p>
        </div>
      </div>

      {/* Payment records */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <CreditCard size={16} className="text-muted-foreground" />
          <h3 className="font-semibold text-foreground text-sm">{withFines.length > 0 ? `${withFines.length} records with fines` : "No fines to show"}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide" style={{ backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}>
                <th className="p-3 text-left">Book</th>
                {canManage && <th className="p-3 text-left">Member</th>}
                <th className="p-3 text-left">Due Date</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-right">Fine</th>
                <th className="p-3 text-right">Paid</th>
                <th className="p-3 text-right">Balance</th>
                <th className="p-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={canManage ? 8 : 7} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : withFines.length === 0 ? (
                <tr><td colSpan={canManage ? 8 : 7} className="p-8 text-center text-muted-foreground">
                  <CheckCircle size={32} className="mx-auto mb-2 text-green-500 opacity-50" />
                  No outstanding fines.
                </td></tr>
              ) : withFines.map((r) => {
                const paid = r.paidFine || 0;
                const bal = Math.max(0, (r.fine || 0) - paid);
                return (
                  <tr key={r.id} className="hover:bg-secondary/50 transition-colors">
                    <td className="p-3 font-medium text-foreground">{r.bookTitle}</td>
                    {canManage && <td className="p-3 text-muted-foreground">{r.memberName}</td>}
                    <td className="p-3 text-xs text-red-500">{r.dueDate}</td>
                    <td className="p-3">
                      <Badge variant={r.status === "overdue" ? "danger" : r.status === "returned" ? "default" : "info"}>{r.status}</Badge>
                    </td>
                    <td className="p-3 text-right font-semibold text-red-600 dark:text-red-400">${(r.fine || 0).toFixed(2)}</td>
                    <td className="p-3 text-right text-green-600 dark:text-green-400">${paid.toFixed(2)}</td>
                    <td className="p-3 text-right font-bold" style={{ color: bal > 0 ? "var(--destructive)" : "var(--muted-foreground)" }}>
                      {bal > 0 ? `$${bal.toFixed(2)}` : <span className="text-green-600 dark:text-green-400 text-xs">Paid</span>}
                    </td>
                    <td className="p-3">
                      {bal > 0 && (
                        payingId === r.id ? (
                          <div className="flex items-center gap-1">
                            <input type="number" step="0.01" min="0.01" max={bal} value={payAmount} onChange={(e) => setPayAmount(e.target.value)} placeholder={`Max $${bal.toFixed(2)}`} className="w-24 rounded border border-border bg-input-background px-2 py-1 text-xs text-foreground" />
                            <button onClick={() => submitPayment(r.id)} className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors">Pay</button>
                            <button onClick={() => { setPayingId(null); setPayAmount(""); }} className="text-xs text-muted-foreground hover:text-foreground">✕</button>
                          </div>
                        ) : (
                          <button onClick={() => { setPayingId(r.id); setPayAmount(""); }} className="inline-flex items-center gap-1 rounded-md bg-accent/10 text-accent hover:bg-accent/20 px-2 py-1 text-xs font-medium transition-colors">
                            <CreditCard size={11} /> Pay Fine
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
