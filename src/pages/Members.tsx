import { useEffect, useMemo, useState } from "react";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Edit2, Plus, Search } from "lucide-react";
import Badge from "../components/ui/Badge";
import { fetchMembers, saveMember as persistMember } from "../lib/api";
import type { Member } from "../types";
import type { AuthSession } from "../types/auth";

type MemberForm = Omit<Member, "id" | "joinDate" | "borrowedCount"> & { password?: string };

const emptyForm: MemberForm = {
  name: "", email: "", phone: "", membershipType: "standard",
  expiryDate: new Date().toISOString().slice(0, 10), status: "active", password: "",
};

function statusVariant(status: Member["status"]): "success" | "warning" | "danger" {
  return { active: "success", suspended: "danger", expired: "warning" }[status] as "success" | "warning" | "danger";
}
function membershipVariant(type: Member["membershipType"]): "success" | "info" | "default" {
  return { premium: "success", standard: "default", student: "info", senior: "default" }[type] as "success" | "info" | "default";
}

export default function Members({ canManage, session }: { canManage: boolean; session: AuthSession }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Member | null>(null);
  const [form, setForm] = useState<MemberForm>({ ...emptyForm });
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetchMembers(session).then(setMembers).catch((err) => setError(err instanceof Error ? err.message : "Could not load members")).finally(() => setLoading(false));
  }, [session]);

  const filtered = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    m.membershipType.toLowerCase().includes(search.toLowerCase())
  );

  const datagridSx = {
    border: "none",
    fontFamily: "var(--font-body)",
    fontSize: 13,
    color: "var(--foreground)",
    "& .MuiDataGrid-columnHeaders": { backgroundColor: "var(--muted)", color: "var(--muted-foreground)", fontSize: 11, textTransform: "uppercase" },
    "& .MuiDataGrid-row:hover": { backgroundColor: "var(--secondary)" },
    "& .MuiDataGrid-cell": { borderColor: "var(--border)", color: "var(--foreground)" },
    "& .MuiDataGrid-footerContainer": { borderColor: "var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" },
    "& .MuiTablePagination-root, & .MuiSvgIcon-root, & .MuiTablePagination-select, & .MuiTablePagination-displayedRows, & .MuiTablePagination-selectLabel": { color: "var(--muted-foreground)" },
    "& .MuiDataGrid-columnSeparator": { color: "var(--border)" },
    "& .MuiDataGrid-sortIcon": { color: "var(--muted-foreground)" },
    "& .MuiCheckbox-root": { color: "var(--muted-foreground)" },
  };

  const columns = useMemo<GridColDef[]>(() => [
    { field: "id", headerName: "ID", width: 80, renderCell: (p) => <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted-foreground)" }}>{String(p.value).slice(-6)}</span> },
    { field: "name", headerName: "Name", flex: 1.2, minWidth: 160, renderCell: (p) => <span className="font-medium" style={{ color: "var(--foreground)" }}>{p.value}</span> },
    { field: "email", headerName: "Email", flex: 1.3, minWidth: 180, renderCell: (p) => <span style={{ color: "var(--muted-foreground)" }}>{p.value}</span> },
    { field: "phone", headerName: "Phone", width: 120, renderCell: (p) => <span style={{ color: "var(--muted-foreground)" }}>{p.value}</span> },
    { field: "membershipType", headerName: "Type", width: 110, renderCell: (p) => <Badge variant={membershipVariant(p.value as Member["membershipType"])}>{String(p.value).replace(/^\w/, (c) => c.toUpperCase())}</Badge> },
    { field: "expiryDate", headerName: "Expires", width: 110, renderCell: (p) => <span style={{ color: "var(--muted-foreground)", fontSize: 12 }}>{p.value}</span> },
    { field: "status", headerName: "Status", width: 100, renderCell: (p) => <Badge variant={statusVariant(p.value as Member["status"])}>{String(p.value).replace(/^\w/, (c) => c.toUpperCase())}</Badge> },
    {
      field: "actions", headerName: "", width: 80, sortable: false, renderCell: (p) =>
        canManage ? (
          <button onClick={() => openEdit(p.row as Member)} className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-secondary transition-colors" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
            <Edit2 size={12} /> Edit
          </button>
        ) : null,
    },
  ], [canManage]);

  function openAdd() { setEditing(null); setForm({ ...emptyForm }); setModalOpen(true); }
  function openEdit(member: Member) {
    setEditing(member);
    const { id: _id, joinDate: _j, borrowedCount: _b, ...values } = member;
    setForm({ ...values, password: "" });
    setModalOpen(true);
  }
  function closeModal() { setEditing(null); setForm({ ...emptyForm }); setModalOpen(false); }

  async function saveMember(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true); setError("");
    try {
      const payload: any = { ...form };
      if (!payload.password) delete payload.password;
      const saved = await persistMember(session, payload, editing?.id);
      setMembers((cur) => editing ? cur.map((m) => m.id === editing.id ? saved : m) : [saved, ...cur]);
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save member");
    } finally { setSaving(false); }
  }

  const active = members.filter((m) => m.status === "active").length;
  const suspended = members.filter((m) => m.status === "suspended").length;

  return (
    <div className="p-6 flex flex-col gap-5 h-full overflow-hidden" style={{ fontFamily: "var(--font-body)" }}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground" style={{ fontFamily: "var(--font-display)" }}>Member Registry</h2>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-sm text-muted-foreground">{loading ? "Loading..." : `${members.length} members`}</p>
            <Badge variant="success">{active} Active</Badge>
            {suspended > 0 && <Badge variant="danger">{suspended} Suspended</Badge>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-3 text-muted-foreground pointer-events-none" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="pl-9 pr-4 py-2 text-sm bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring/40 w-52" />
          </div>
          {canManage && <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-accent text-white text-sm font-medium rounded-md hover:bg-accent/90"><Plus size={15} /> Add Member</button>}
        </div>
      </div>

      {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}

      <div className="flex-1 bg-card rounded-xl border border-border overflow-hidden">
        <DataGrid rows={filtered} columns={columns} loading={loading} pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} disableRowSelectionOnClick sx={datagridSx} />
      </div>

      {canManage && modalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4">
          <form onSubmit={saveMember} className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-xl">
            <h3 className="mb-4 text-base font-semibold text-foreground">{editing ? "Edit Member" : "Add Member"}</h3>
            {error && <p className="mb-3 text-sm text-destructive">{error}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full Name" className="rounded-md border border-border bg-input-background px-3 py-2 text-sm text-foreground" />
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email address" className="rounded-md border border-border bg-input-background px-3 py-2 text-sm text-foreground" />
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" className="rounded-md border border-border bg-input-background px-3 py-2 text-sm text-foreground" />
              <input required type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} className="rounded-md border border-border bg-input-background px-3 py-2 text-sm text-foreground" />
              <select value={form.membershipType} onChange={(e) => setForm({ ...form, membershipType: e.target.value as Member["membershipType"] })} className="rounded-md border border-border bg-input-background px-3 py-2 text-sm text-foreground">
                <option value="standard">Standard</option><option value="premium">Premium</option><option value="student">Student</option><option value="senior">Senior</option>
              </select>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Member["status"] })} className="rounded-md border border-border bg-input-background px-3 py-2 text-sm text-foreground">
                <option value="active">Active</option><option value="suspended">Suspended</option><option value="expired">Expired</option>
              </select>
              <div className="col-span-full">
                <label className="block text-xs text-muted-foreground mb-1">{editing ? "New password (leave blank to keep current)" : "Password (member will use this to login)"}</label>
                <input
                  type="password"
                  value={form.password ?? ""}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={editing ? "Leave blank to keep password" : "Set login password"}
                  required={!editing}
                  minLength={8}
                  className="w-full rounded-md border border-border bg-input-background px-3 py-2 text-sm text-foreground"
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={closeModal} className="rounded-md border border-border px-4 py-2 text-sm hover:bg-secondary text-foreground">Cancel</button>
              <button disabled={saving} className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-70">{saving ? "Saving..." : editing ? "Update" : "Create Member"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
