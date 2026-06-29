import { useEffect, useState } from "react";
import { User, Mail, Phone, Shield, Key, Save, Edit2, X, Check } from "lucide-react";
import type { AuthSession } from "../types/auth";
import { updateProfile, fetchProfile } from "../lib/api";

interface ProfileProps {
  session: AuthSession;
  onSessionUpdate: (session: AuthSession) => void;
}

export default function Profile({ session, onSessionUpdate }: ProfileProps) {
  const [name, setName] = useState(session.user.name);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  // snapshot to restore on cancel
  const [snapshot, setSnapshot] = useState({ name: session.user.name, phone: "" });

  useEffect(() => {
    fetchProfile(session)
      .then((p) => { setName(p.name); setPhone(p.phone ?? ""); setSnapshot({ name: p.name, phone: p.phone ?? "" }); })
      .catch(() => {});
  }, [session.accessToken]);

  function startEdit() {
    setSnapshot({ name, phone });
    setPassword(""); setConfirm(""); setError(""); setSuccess("");
    setEditMode(true);
  }

  function cancelEdit() {
    setName(snapshot.name); setPhone(snapshot.phone);
    setPassword(""); setConfirm(""); setError("");
    setEditMode(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (password && password !== confirm) { setError("Passwords do not match"); return; }
    setSaving(true); setError(""); setSuccess("");
    try {
      const updated = await updateProfile(session, { name, phone: phone || undefined, password: password || undefined });
      onSessionUpdate({ ...session, user: { ...session.user, name: updated.name } });
      setSuccess("Profile updated successfully!");
      setPassword(""); setConfirm("");
      setEditMode(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update profile");
    } finally { setSaving(false); }
  }

  const roleColors: Record<string, { bg: string; text: string; dot: string }> = {
    admin:     { bg: "rgba(239,68,68,0.12)",    text: "#ef4444", dot: "#ef4444" },
    librarian: { bg: "rgba(245,158,11,0.12)",   text: "#f59e0b", dot: "#f59e0b" },
    staff:     { bg: "rgba(59,130,246,0.12)",   text: "#3b82f6", dot: "#3b82f6" },
    user:      { bg: "rgba(16,185,129,0.12)",   text: "#10b981", dot: "#10b981" },
  };
  const rc = roleColors[session.user.role] ?? roleColors.user;

  const fieldClass = "w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors";
  const fieldStyle = (disabled?: boolean) => ({
    background: disabled ? "var(--muted)" : "var(--input-background)",
    border: "1px solid var(--border)",
    color: disabled ? "var(--muted-foreground)" : "var(--foreground)",
    cursor: disabled ? "not-allowed" : "text",
  });

  return (
    <div className="h-full overflow-y-auto p-6" style={{ fontFamily: "var(--font-body)" }}>
      <div className="max-w-lg mx-auto space-y-5">

        {/* Title row */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>My Profile</h2>
            <p className="text-sm text-muted-foreground">Your account details and preferences</p>
          </div>
          {!editMode ? (
            <button onClick={startEdit}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all hover:scale-[1.02]"
              style={{ background: "var(--accent)", color: "#fff" }}>
              <Edit2 size={14} /> Edit Profile
            </button>
          ) : (
            <button onClick={cancelEdit}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors"
              style={{ border: "1px solid var(--border)", color: "var(--muted-foreground)", background: "transparent" }}>
              <X size={14} /> Cancel
            </button>
          )}
        </div>

        {/* Avatar card */}
        <div className="rounded-xl p-5 flex items-center gap-4" style={{ border: "1px solid var(--border)", background: "var(--card)" }}>
          <div className="relative">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
              style={{ background: `${rc.dot}22`, color: rc.dot }}>
              {session.user.name.charAt(0).toUpperCase()}
            </div>
            {editMode && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                <Edit2 size={10} className="text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-base text-foreground">{editMode ? name || session.user.name : session.user.name}</p>
            <p className="text-sm text-muted-foreground">{session.user.email}</p>
            <span className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-semibold mt-1"
              style={{ background: rc.bg, color: rc.text }}>
              <Shield size={10} />
              {session.user.role.charAt(0).toUpperCase() + session.user.role.slice(1)}
            </span>
          </div>
          {editMode && (
            <span className="text-xs px-2 py-1 rounded-full font-medium"
              style={{ background: "rgba(200,132,58,0.12)", color: "var(--accent)" }}>
              Editing
            </span>
          )}
        </div>

        {/* Alerts */}
        {success && (
          <div className="rounded-lg p-3 text-sm flex items-center gap-2"
            style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981" }}>
            <Check size={15} /> {success}
          </div>
        )}
        {error && (
          <div className="rounded-lg p-3 text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444" }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSave} className="rounded-xl p-5 space-y-4" style={{ border: "1px solid var(--border)", background: "var(--card)" }}>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Personal Information</h3>
            {editMode && <span className="text-xs text-muted-foreground">Fields marked * are required</span>}
          </div>

          <div>
            <label className="block text-xs font-medium mb-1 flex items-center gap-1" style={{ color: "var(--muted-foreground)" }}>
              <User size={11} /> Full Name {editMode && <span className="text-red-500">*</span>}
            </label>
            <input required={editMode} value={name} onChange={(e) => setName(e.target.value)}
              disabled={!editMode} placeholder="Your full name"
              className={fieldClass} style={fieldStyle(!editMode)} />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1 flex items-center gap-1" style={{ color: "var(--muted-foreground)" }}>
              <Mail size={11} /> Email Address
            </label>
            <input value={session.user.email} disabled
              className={fieldClass} style={fieldStyle(true)} />
            <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1 flex items-center gap-1" style={{ color: "var(--muted-foreground)" }}>
              <Phone size={11} /> Phone Number
            </label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)}
              disabled={!editMode} placeholder={editMode ? "Enter phone number" : "Not set"}
              className={fieldClass} style={fieldStyle(!editMode)} />
          </div>

          {/* Password section — only in edit mode */}
          {editMode && (
            <>
              <div className="pt-2" style={{ borderTop: "1px solid var(--border)" }}>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Key size={14} style={{ color: "var(--accent)" }} /> Change Password
                  <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>New Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="Leave blank to keep current" minLength={8}
                      className={fieldClass} style={fieldStyle(false)} />
                  </div>
                  {password && (
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>Confirm Password</label>
                      <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                        placeholder="Re-enter new password"
                        className={fieldClass} style={fieldStyle(false)} />
                      {confirm && password !== confirm && (
                        <p className="text-xs mt-1" style={{ color: "#ef4444" }}>Passwords don't match</p>
                      )}
                      {confirm && password === confirm && (
                        <p className="text-xs mt-1" style={{ color: "#10b981" }}>✓ Passwords match</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Save button — only in edit mode */}
          {editMode && (
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={cancelEdit}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors"
                style={{ border: "1px solid var(--border)", color: "var(--foreground)", background: "transparent" }}>
                Cancel
              </button>
              <button disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-60"
                style={{ background: "var(--accent)" }}>
                <Save size={14} /> {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </form>

        {/* Read-only info footer */}
        {!editMode && (
          <div className="rounded-xl p-4 text-xs space-y-1" style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>
            <p>Click <strong style={{ color: "var(--foreground)" }}>Edit Profile</strong> to update your name, phone number, or password.</p>
            <p>Your role and email address can only be changed by an administrator.</p>
          </div>
        )}
      </div>
    </div>
  );
}
