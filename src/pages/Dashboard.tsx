import { useEffect, useState } from "react";
import { AlertTriangle, ArrowLeftRight, BookMarked, BookOpen, Users, TrendingUp, CheckCircle, Clock } from "lucide-react";
import StatCard from "../components/ui/StatCard";
import Badge from "../components/ui/Badge";
import { fetchBooks, fetchBorrowing, fetchEvents, fetchMembers } from "../lib/api";
import type { Book, BorrowingRecord, LibraryEvent, Member } from "../types";
import type { AuthSession } from "../types/auth";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line, CartesianGrid } from "recharts";

const COLORS = ["#c8843a", "#0f2640", "#2e7d6b", "#7c3d8a", "#c0392b", "#e67e22", "#27ae60"];

export default function Dashboard({ canManage, session }: { canManage: boolean; session: AuthSession }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loans, setLoans] = useState<BorrowingRecord[]>([]);
  const [events, setEvents] = useState<LibraryEvent[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const membersFetch = canManage ? fetchMembers(session) : Promise.resolve([] as Member[]);
    Promise.all([fetchBooks(session), membersFetch, fetchBorrowing(session), fetchEvents()])
      .then(([b, m, l, e]) => { setBooks(b); setMembers(m); setLoans(l); setEvents(e); })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Could not load dashboard"));
  }, [session.accessToken, canManage]);

  const active = loans.filter((loan) => loan.status === "active");
  const overdue = loans.filter((loan) => loan.status === "overdue");
  const returned = loans.filter((loan) => loan.status === "returned");
  const requested = loans.filter((loan) => (loan.status as string) === "requested");
  const month = new Date().toISOString().slice(0, 7);
  const newBooks = books.filter((book) => book.addedDate.startsWith(month)).length;

  // Genre distribution for pie chart
  const genreCounts = books.reduce<Record<string, number>>((acc, b) => {
    acc[b.genre] = (acc[b.genre] || 0) + 1;
    return acc;
  }, {});
  const genreData = Object.entries(genreCounts).map(([name, value]) => ({ name, value }));

  // Membership type bar chart
  const membershipCounts = members.reduce<Record<string, number>>((acc, m) => {
    acc[m.membershipType] = (acc[m.membershipType] || 0) + 1;
    return acc;
  }, {});
  const membershipData = Object.entries(membershipCounts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));

  // Loan status bar chart
  const loanStatusData = [
    { name: "Active", value: active.length, fill: "#c8843a" },
    { name: "Overdue", value: overdue.length, fill: "#c0392b" },
    { name: "Returned", value: returned.length, fill: "#2e7d6b" },
    { name: "Requested", value: requested.length, fill: "#7c3d8a" },
  ];

  // Role distribution
  const roleData = [
    { name: "Active Members", value: members.filter(m => m.status === "active").length },
    { name: "Suspended", value: members.filter(m => m.status === "suspended").length },
    { name: "Expired", value: members.filter(m => m.status === "expired").length },
  ];

  const totalFines = loans.reduce((sum, l) => sum + (l.fine || 0), 0);

  return (
    <div className="h-full space-y-6 overflow-y-auto p-6">
      {error && <div className="rounded-md border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-400">{error}</div>}

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        <StatCard title="Book Titles" value={books.length} subtitle={`${books.reduce((sum, b) => sum + b.totalCopies, 0)} total copies`} icon={BookOpen} accent />
        <StatCard title="Members" value={members.length} icon={Users} />
        <StatCard title="Active Loans" value={active.length} icon={ArrowLeftRight} />
        <StatCard title="Overdue" value={overdue.length} icon={AlertTriangle} />
        <StatCard title="New Books" value={newBooks} subtitle="Added this month" icon={BookMarked} />
        <StatCard title="Total Fines" value={`$${totalFines.toFixed(2)}`} subtitle="Outstanding" icon={TrendingUp} />
      </div>

      {/* Charts row 1 */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Genre Pie Chart */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 font-semibold text-foreground text-sm">Books by Genre</h3>
          {genreData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={genreData} cx="50%" cy="50%" outerRadius={70} dataKey="value" labelLine={false}>
                  {genreData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)", borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11, color: "var(--muted-foreground)" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="py-16 text-center text-sm text-muted-foreground">No data yet</p>}
        </div>

        {/* Loan Status Bar Chart */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 font-semibold text-foreground text-sm">Loan Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={loanStatusData} barSize={28}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)", borderRadius: 8 }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {loanStatusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Member Status Pie */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 font-semibold text-foreground text-sm">Member Status</h3>
          {members.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={roleData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" labelLine={false}>
                  {roleData.map((_, i) => <Cell key={i} fill={["#2e7d6b", "#c0392b", "#c8843a"][i]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)", borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11, color: "var(--muted-foreground)" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="py-16 text-center text-sm text-muted-foreground">No data yet</p>}
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Membership type bar */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 font-semibold text-foreground text-sm">Members by Type</h3>
          {membershipData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={membershipData} barSize={32}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)", borderRadius: 8 }} />
                <Bar dataKey="value" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="py-12 text-center text-sm text-muted-foreground">No data yet</p>}
        </div>

        {/* Role based access info */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 font-semibold text-foreground text-sm">Role-Based Access Control</h3>
          <div className="space-y-2">
            {[
              { role: "Admin", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300", perms: ["Full access", "User mgmt", "Reports", "Payments"] },
              { role: "Librarian", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300", perms: ["Books", "Members", "Borrowing", "Events"] },
              { role: "User/Member", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300", perms: ["Browse books", "Request loans", "My payments", "Register events"] },
            ].map(({ role, color, perms }) => (
              <div key={role} className="flex items-center gap-3 p-2 rounded-lg bg-muted/40">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${color}`}>{role}</span>
                <div className="flex flex-wrap gap-1">
                  {perms.map(p => <span key={p} className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full border border-border">{p}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Events + Overdue */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h3 className="mb-3 font-semibold">Upcoming Events</h3>
          <div className="divide-y divide-border border-y border-border">
            {events.slice(0, 5).map((event) => (
              <div key={event.id} className="flex justify-between py-3">
                <div><p className="font-medium">{event.title}</p><p className="text-xs text-muted-foreground">{event.location}</p></div>
                <span className="text-sm">{event.date}</span>
              </div>
            ))}
            {!events.length && <p className="py-6 text-sm text-muted-foreground">No events added yet.</p>}
          </div>
        </section>
        <section>
          <h3 className="mb-3 flex items-center gap-2 font-semibold">Overdue Returns <Badge variant="danger">{overdue.length}</Badge></h3>
          <div className="divide-y divide-border border-y border-border">
            {overdue.slice(0, 5).map((loan) => (
              <div key={loan.id} className="flex justify-between py-3">
                <div><p className="font-medium">{loan.bookTitle}</p><p className="text-xs text-muted-foreground">{loan.memberName}</p></div>
                <div className="text-right"><span className="text-sm text-red-600">{loan.dueDate}</span>
                  {(loan.fine || 0) > 0 && <p className="text-xs text-red-500">${loan.fine?.toFixed(2)} fine</p>}
                </div>
              </div>
            ))}
            {!overdue.length && <p className="py-6 text-sm text-muted-foreground">No overdue loans.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
