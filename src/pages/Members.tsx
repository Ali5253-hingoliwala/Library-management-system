import { useEffect, useState } from "react";
import { Edit2, Plus, Search, Trash2, User, Mail, Phone, Calendar, Shield, X } from "lucide-react";
import { fetchMembers, saveMember as persistMember, deleteMember } from "../lib/api";
import type { Member } from "../types";
import type { AuthSession } from "../types/auth";

type MemberForm = Omit<Member, "id" | "joinDate" | "borrowedCount"> & { password?: string };
const emptyForm: MemberForm = { name: "", email: "", phone: "", membershipType: "standard", expiryDate: new Date().toISOString().slice(0, 10), status: "active", password: "" };

const STATUS_CONFIG: Record<Member["status"], { label: string; color: string; bg: string; dot: string }> = {
  active:    { label: "Active",    color: "#10b981", bg: "rgba(16,185,129,0.12)",  dot: "#10b981" },
  suspended: { label: "Suspended", color: "#ef4444", bg: "rgba(239,68,68,0.12)",   dot: "#ef4444" },
  expired:   { label: "Expired",   color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  dot: "#f59e0b" },
};
const TYPE_CONFIG: Record<Member["membershipType"], { label: string; color: string; bg: string }> = {
  premium:  { label: "Premium",  color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
  standard: { label: "Standard", color: "#60a5fa", bg: "rgba(96,165,250,0.12)"  },
  student:  { label: "Student",  color: "#34d399", bg: "rgba(52,211,153,0.12)"  },
  senior:   { label: "Senior",   color: "#fb923c", bg: "rgba(251,146,60,0.12)"  },
};

function Avatar({ name }: { name: string }) {
  const colors = ["#a78bfa","#34d399","#fb923c","#60a5fa","#f472b6","#c8843a","#2dd4bf"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ background: `${color}22`, color }}>{name.charAt(0).toUpperCase()}</div>;
}

export default function Members({ canManage, session }: { canManage: boolean; session: AuthSession }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [editing, setEditing] = useState<Member | null>(null);
  const [form, setForm] = useState<MemberForm>({ ...emptyForm });
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try { setMembers(await fetchMembers(session)); setError(""); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not load members"); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, [session]);

  const filtered = members.filter(m => {
    const q = search.toLowerCase();
    return (!q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.phone?.includes(q))
      && (!filterType || m.membershipType === filterType)
      && (!filterStatus || m.status === filterStatus);
  });

  function openAdd() { setEditing(null); setForm({ ...emptyForm }); setModalOpen(true); }
  function openEdit(m: Member) { setEditing(m); const { id: _id, joinDate: _j, borrowedCount: _b, ...v } = m; setForm({ ...v, password: "" }); setModalOpen(true); }
  function closeModal() { setEditing(null); setForm({ ...emptyForm }); setModalOpen(false); setError(""); }

  async function saveMember(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSaving(true); setError("");
    try {
      const payload: any = { ...form };
      if (!payload.password) delete payload.password;
      const saved = await persistMember(session, payload, editing?.id);
      setMembers(cur => editing ? cur.map(m => m.id === editing.id ? saved : m) : [saved, ...cur]);
      closeModal();
    } catch (err) { setError(err instanceof Error ? err.message : "Could not save"); }
    finally { setSaving(false); }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await deleteMember(session, deleteTarget.id); setMembers(cur => cur.filter(m => m.id !== deleteTarget.id)); setDeleteTarget(null); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not delete"); setDeleteTarget(null); }
    finally { setDeleting(false); }
  }

  const active = members.filter(m => m.status === "active").length;
  const hasFilters = !!(search || filterType || filterStatus);
  const fieldStyle = (disabled?: boolean) => ({ background: disabled ? "var(--muted)" : "var(--input-background)", border: "1px solid var(--border)", color: disabled ? "var(--muted-foreground)" : "var(--foreground)" });

  return (
    <div className="p-6 flex flex-col gap-5 h-full overflow-hidden" style={{ fontFamily: "var(--font-body)" }}>
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>Member Registry</h2>
          <div className="flex items-center gap-3 mt-1 text-xs">
            <span className="text-muted-foreground">{loading ? "Loading..." : `${members.length} total members`}</span>
            <span className="font-semibold" style={{ color: "#10b981" }}>● {active} active</span>
            <span className="font-semibold" style={{ color: "#ef4444" }}>● {members.filter(m => m.status === "suspended").length} suspended</span>
          </div>
        </div>
        {canManage && <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg hover:scale-[1.02] transition-all" style={{ background: "var(--accent)", color: "#fff" }}><Plus size={15} /> Add Member</button>}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-52">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--muted-foreground)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, phone..." className="pl-9 pr-4 py-2 text-sm rounded-lg w-full focus:outline-none" style={fieldStyle()} />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="text-sm rounded-lg px-3 py-2" style={fieldStyle()}>
          <option value="">All Types</option><option value="standard">Standard</option><option value="premium">Premium</option><option value="student">Student</option><option value="senior">Senior</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="text-sm rounded-lg px-3 py-2" style={fieldStyle()}>
          <option value="">All Status</option><option value="active">Active</option><option value="suspended">Suspended</option><option value="expired">Expired</option>
        </select>
        {hasFilters && <button onClick={() => { setSearch(""); setFilterType(""); setFilterStatus(""); }} className="flex items-center gap-1 text-xs px-2.5 py-2 rounded-lg" style={{ color: "var(--muted-foreground)", border: "1px solid var(--border)", background: "var(--input-background)" }}><X size={12} /> Clear</button>}
      </div>

      {error && <div className="rounded-lg px-3 py-2 text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444" }}>{error}</div>}

      {/* TABLE */}
      <div className="flex-1 rounded-xl overflow-hidden flex flex-col" style={{ border: "1px solid var(--border)", background: "var(--card)" }}>
        <div className="overflow-auto flex-1">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ background: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
                {["Member", "Email", "Phone", "Type", "Expires", "Borrowed", "Status", ""].map((h, i) => (
                  <th key={i} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest whitespace-nowrap" style={{ color: "var(--muted-foreground)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(5)].map((_, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>{[...Array(8)].map((_, j) => <td key={j} className="px-4 py-4"><div className="h-4 rounded animate-pulse" style={{ background: "var(--muted)", width: j === 0 ? "70%" : "50%" }} /></td>)}</tr>
              )) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="py-20 text-center" style={{ color: "var(--muted-foreground)" }}><User size={36} className="mx-auto mb-3 opacity-20" /><p className="font-medium">No members found</p></td></tr>
              ) : filtered.map(member => {
                const sc = STATUS_CONFIG[member.status];
                const tc = TYPE_CONFIG[member.membershipType];
                return (
                  <tr key={member.id} style={{ borderBottom: "1px solid var(--border)" }} onMouseEnter={e => (e.currentTarget.style.background = "var(--secondary)")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={member.name} />
                        <div><p className="font-semibold text-foreground">{member.name}</p><p className="text-xs text-muted-foreground font-mono">{member.id.slice(-6)}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="text-xs flex items-center gap-1 text-muted-foreground"><Mail size={10} />{member.email}</span></td>
                    <td className="px-4 py-3"><span className="text-xs flex items-center gap-1 text-muted-foreground"><Phone size={10} />{member.phone || "—"}</span></td>
                    <td className="px-4 py-3"><span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: tc.bg, color: tc.color }}>{tc.label}</span></td>
                    <td className="px-4 py-3"><span className="text-xs flex items-center gap-1 text-muted-foreground"><Calendar size={10} />{member.expiryDate}</span></td>
                    <td className="px-4 py-3 text-center"><span className="font-bold text-sm" style={{ color: "var(--foreground)" }}>{member.borrowedCount}</span></td>
                    <td className="px-4 py-3"><span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: sc.bg, color: sc.color }}><span className="w-1.5 h-1.5 rounded-full" style={{ background: sc.dot }} />{sc.label}</span></td>
                    <td className="px-4 py-3">
                      {canManage && (
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => openEdit(member)} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all hover:scale-[1.03]" style={{ border: "1px solid var(--border)", color: "var(--foreground)", background: "var(--card)" }}><Edit2 size={11} /> Edit</button>
                          <button onClick={() => setDeleteTarget(member)} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all hover:scale-[1.03]" style={{ border: "1px solid rgba(239,68,68,0.4)", color: "#ef4444", background: "rgba(239,68,68,0.08)" }}><Trash2 size={11} /> Delete</button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 flex items-center justify-between text-xs" style={{ borderTop: "1px solid var(--border)", color: "var(--muted-foreground)" }}>
          <span>Showing <strong style={{ color: "var(--foreground)" }}>{filtered.length}</strong> of {members.length} members</span>
          {hasFilters && <span style={{ color: "var(--accent)" }}>Filtered</span>}
        </div>
      </div>

      {/* ADD/EDIT MODAL */}
      {canManage && modalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <form onSubmit={saveMember} className="w-full max-w-lg rounded-2xl p-6 shadow-2xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(200,132,58,0.12)" }}><User size={18} style={{ color: "var(--accent)" }} /></div>
              <div><h3 className="text-base font-bold text-foreground">{editing ? "Edit Member" : "Add Member"}</h3><p className="text-xs text-muted-foreground">{editing ? "Update member details" : "Fill in member information"}</p></div>
              <button type="button" onClick={closeModal} className="ml-auto p-1.5 rounded-lg" style={{ color: "var(--muted-foreground)" }}><X size={16} /></button>
            </div>
            {error && <div className="mb-3 text-sm px-3 py-2 rounded-lg" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444" }}>{error}</div>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2"><label className="block text-xs font-medium mb-1 text-muted-foreground">Full Name *</label><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full name" className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none" style={fieldStyle()} /></div>
              <div><label className="block text-xs font-medium mb-1 text-muted-foreground">Email *</label><input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email address" className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none" style={fieldStyle()} /></div>
              <div><label className="block text-xs font-medium mb-1 text-muted-foreground">Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none" style={fieldStyle()} /></div>
              <div><label className="block text-xs font-medium mb-1 text-muted-foreground">Membership Type</label>
                <select value={form.membershipType} onChange={e => setForm({ ...form, membershipType: e.target.value as Member["membershipType"] })} className="w-full rounded-lg px-3 py-2 text-sm" style={fieldStyle()}>
                  <option value="standard">Standard</option><option value="premium">Premium</option><option value="student">Student</option><option value="senior">Senior</option>
                </select>
              </div>
              <div><label className="block text-xs font-medium mb-1 text-muted-foreground">Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Member["status"] })} className="w-full rounded-lg px-3 py-2 text-sm" style={fieldStyle()}>
                  <option value="active">Active</option><option value="suspended">Suspended</option><option value="expired">Expired</option>
                </select>
              </div>
              <div className="sm:col-span-2"><label className="block text-xs font-medium mb-1 text-muted-foreground">Expiry Date *</label><input required type="date" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} className="w-full rounded-lg px-3 py-2 text-sm" style={fieldStyle()} /></div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1 text-muted-foreground flex items-center gap-1"><Shield size={10} />{editing ? "New Password (leave blank to keep)" : "Password * (member uses this to login)"}</label>
                <input type="password" value={form.password ?? ""} onChange={e => setForm({ ...form, password: e.target.value })} placeholder={editing ? "Leave blank to keep password" : "Set login password"} required={!editing} minLength={8} className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none" style={fieldStyle()} />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={closeModal} className="rounded-lg px-4 py-2 text-sm font-medium" style={{ border: "1px solid var(--border)", color: "var(--foreground)", background: "transparent" }}>Cancel</button>
              <button disabled={saving} className="rounded-lg px-5 py-2 text-sm font-semibold text-white disabled:opacity-60" style={{ background: "var(--accent)" }}>{saving ? "Saving..." : editing ? "Update Member" : "Add Member"}</button>
            </div>
          </form>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-sm rounded-2xl p-6 shadow-2xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(239,68,68,0.12)" }}><Trash2 size={22} style={{ color: "#ef4444" }} /></div>
            <h3 className="text-base font-bold text-center text-foreground mb-1">Delete Member?</h3>
            <p className="text-sm text-center text-muted-foreground mb-5">Are you sure you want to delete <strong className="text-foreground">"{deleteTarget.name}"</strong>? This cannot be undone.</p>
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
