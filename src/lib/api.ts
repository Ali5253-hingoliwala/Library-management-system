import type { Book, BorrowingRecord, LibraryEvent, Member } from "../types";
import type { AuthSession } from "../types/auth";

export const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";

type RequestOptions = RequestInit & {
  token?: string;
};

async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (options.token) headers.set("Authorization", `Bearer ${options.token}`);

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    const message = Array.isArray(error?.message) ? error.message.join(", ") : error?.message;
    throw new Error(message ?? `Request failed with status ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

function toDateOnly(value: unknown) {
  if (!value) return "";
  return new Date(String(value)).toISOString().slice(0, 10);
}

function mongoId(value: any) {
  return String(value?._id ?? value?.id ?? value ?? "");
}

function mapBook(book: any): Book {
  return {
    id: mongoId(book),
    title: String(book.title ?? ""),
    author: String(book.author ?? ""),
    isbn: String(book.isbn ?? ""),
    genre: String(book.genre ?? ""),
    publishedYear: Number(book.publishedYear ?? new Date().getFullYear()),
    totalCopies: Number(book.totalCopies ?? 0),
    availableCopies: Number(book.availableCopies ?? 0),
    status: book.status ?? "available",
    addedDate: toDateOnly(book.createdAt),
  };
}

function mapMember(member: any): Member {
  return {
    id: mongoId(member),
    name: String(member.name ?? ""),
    email: String(member.email ?? ""),
    phone: String(member.phone ?? ""),
    membershipType: member.membershipType ?? "standard",
    joinDate: toDateOnly(member.createdAt),
    expiryDate: toDateOnly(member.expiryDate),
    borrowedCount: Number(member.borrowedCount ?? 0),
    status: member.status ?? "active",
  };
}

function mapBorrowing(record: any): BorrowingRecord {
  const book = typeof record.bookId === "object" ? record.bookId : null;
  const member = typeof record.memberId === "object" ? record.memberId : null;

  return {
    id: mongoId(record),
    bookId: mongoId(record.bookId),
    bookTitle: String(book?.title ?? record.bookTitle ?? "Unknown book"),
    memberId: mongoId(record.memberId),
    memberName: String(member?.name ?? record.memberName ?? "Unknown member"),
    borrowDate: toDateOnly(record.borrowDate),
    dueDate: toDateOnly(record.dueDate),
    returnDate: record.returnDate ? toDateOnly(record.returnDate) : undefined,
    status: record.status ?? "active",
    fine: Number(record.fine ?? 0),
    paidFine: Number(record.paidAmount ?? 0),
  };
}

function mapEvent(event: any): LibraryEvent {
  return {
    id: mongoId(event),
    title: String(event.title ?? ""),
    description: String(event.description ?? ""),
    date: toDateOnly(event.date),
    time: String(event.time ?? ""),
    location: String(event.location ?? ""),
    type: event.type ?? "reading",
    capacity: Number(event.capacity ?? 0),
    registered: Number(event.registered ?? 0),
    isUpcoming: Boolean(event.isUpcoming ?? true),
  };
}

function auth(session: AuthSession): string | undefined {
  return session.accessToken;
}

export async function fetchBooks(session: AuthSession) {
  const data = await apiRequest<any[]>("/books", { token: auth(session) });
  return data.map(mapBook);
}

export async function saveBook(session: AuthSession, book: Omit<Book, "id" | "addedDate">, id?: string) {
  const data = await apiRequest<any>(id ? `/books/${id}` : "/books", {
    method: id ? "PATCH" : "POST",
    token: auth(session),
    body: JSON.stringify(book),
  });
  return mapBook(data);
}

export async function fetchMembers(session: AuthSession) {
  const data = await apiRequest<any[]>("/members", { token: auth(session) });
  return data.map(mapMember);
}

export async function saveMember(session: AuthSession, member: Omit<Member, "id" | "joinDate" | "borrowedCount">, id?: string) {
  const data = await apiRequest<any>(id ? `/members/${id}` : "/members", {
    method: id ? "PATCH" : "POST",
    token: auth(session),
    body: JSON.stringify(member),
  });
  return mapMember(data);
}

export async function fetchBorrowing(session: AuthSession, mine = false) {
  const data = await apiRequest<any[]>(mine ? "/borrowing/me/history" : "/borrowing", { token: auth(session) });
  return data.map(mapBorrowing);
}

export async function createBorrowing(session: AuthSession, loan: { bookId: string; memberId: string; dueDate: string; notes?: string }) {
  const data = await apiRequest<any>("/borrowing", {
    method: "POST",
    token: auth(session),
    body: JSON.stringify(loan),
  });
  return mapBorrowing(data);
}

export async function requestBook(session: AuthSession, bookId: string) {
  const data = await apiRequest<any>("/borrowing/request", {
    method: "POST",
    token: auth(session),
    body: JSON.stringify({ bookId }),
  });
  return mapBorrowing(data);
}

export async function returnBorrowing(session: AuthSession, id: string) {
  const data = await apiRequest<any>(`/borrowing/${id}/return`, {
    method: "PATCH",
    token: auth(session),
  });
  return mapBorrowing(data);
}

export async function fetchEvents() {
  const data = await apiRequest<any[]>("/events");
  return data.map(mapEvent);
}

export async function saveEvent(session: AuthSession, event: Omit<LibraryEvent, "id" | "registered" | "isUpcoming">, id?: string) {
  const data = await apiRequest<any>(id ? `/events/${id}` : "/events", {
    method: id ? "PATCH" : "POST",
    token: auth(session),
    body: JSON.stringify(event),
  });
  return mapEvent(data);
}

export async function registerForEvent(session: AuthSession, id: string) {
  const data = await apiRequest<any>(`/events/${id}/register`, {
    method: "PATCH",
    token: auth(session),
  });
  return mapEvent(data);
}

export async function approveBorrowingRequest(session: AuthSession, id: string, days = 14) {
  const data = await apiRequest<any>(`/borrowing/${id}/approve`, {
    method: "PATCH",
    token: auth(session),
    body: JSON.stringify({ days }),
  });
  return mapBorrowing(data);
}

export async function payFine(session: AuthSession, id: string, amount: number) {
  const data = await apiRequest<any>(`/borrowing/${id}/pay`, {
    method: "POST",
    token: auth(session),
    body: JSON.stringify({ amount }),
  });
  return mapBorrowing(data);
}

export async function fetchProfile(session: AuthSession) {
  return apiRequest<{ id: string; name: string; email: string; phone?: string; role: string }>("/auth/me", { token: auth(session) });
}

export async function updateProfile(session: AuthSession, dto: { name?: string; phone?: string; password?: string }) {
  return apiRequest<{ id: string; name: string; email: string; phone?: string; role: string }>("/auth/me", {
    method: "PATCH",
    token: auth(session),
    body: JSON.stringify(dto),
  });
}

export async function deleteBook(session: AuthSession, id: string) {
  return apiRequest<void>(`/books/${id}`, { method: "DELETE", token: auth(session) });
}

export async function fetchNotifications(session: AuthSession): Promise<import("../types").Notification[]> {
  try {
    return await apiRequest<import("../types").Notification[]>("/notifications", { token: auth(session) });
  } catch {
    // fallback: generate live notifications from real borrowing + events data
    const [loans, events] = await Promise.all([
      fetchBorrowing(session).catch(() => [] as import("../types").BorrowingRecord[]),
      fetchEvents().catch(() => [] as import("../types").LibraryEvent[]),
    ]);
    const notes: import("../types").Notification[] = [];
    const overdue = loans.filter(l => l.status === "overdue");
    if (overdue.length > 0) {
      notes.push({ id: "live-overdue", message: `${overdue.length} book${overdue.length > 1 ? "s are" : " is"} overdue — ${overdue.slice(0,2).map(l => l.memberName).join(", ")}${overdue.length > 2 ? ` +${overdue.length - 2} more` : ""}.`, type: "overdue", timestamp: new Date().toISOString(), read: false });
    }
    const requested = loans.filter(l => (l.status as string) === "requested");
    if (requested.length > 0) {
      notes.push({ id: "live-requests", message: `${requested.length} book request${requested.length > 1 ? "s" : ""} pending approval.`, type: "announcement", timestamp: new Date().toISOString(), read: false });
    }
    const upcoming = events.filter(e => e.isUpcoming).slice(0, 2);
    upcoming.forEach(ev => {
      notes.push({ id: `live-event-${ev.id}`, message: `Upcoming: "${ev.title}" on ${ev.date} — ${ev.registered}/${ev.capacity} registered.`, type: "event", timestamp: new Date().toISOString(), read: false });
    });
    return notes;
  }
}
