import { z } from "zod";
import type { AuthSession, UserRole } from "../types/auth";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";
const SESSION_KEY = "bibliotheca_session";

export const roleSchema = z.enum(["librarian", "user"]);

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = loginSchema
  .extend({
    name: z.string().trim().min(2, "Name must be at least 2 characters"),
    role: roleSchema,
    confirmPassword: z.string().min(8, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;

function normalizeRole(role: unknown): UserRole {
  return role === "admin" || role === "librarian" || role === "staff" || role === "user" ? role : "user";
}

function toSession(data: any, fallback: { name?: string; email: string; role?: UserRole }): AuthSession {
  const user = data?.user ?? data ?? {};
  return {
    accessToken: data?.access_token ?? data?.accessToken,
    user: {
      id: String(user.id ?? user._id ?? crypto.randomUUID()),
      name: String(user.name ?? fallback.name ?? fallback.email.split("@")[0]),
      email: String(user.email ?? fallback.email),
      role: normalizeRole(user.role ?? fallback.role),
    },
  };
}

async function requestAuth(path: "login" | "register", body: unknown) {
  const response = await fetch(`${API_BASE}/auth/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message ?? "Authentication failed");
  }

  return response.json();
}

export async function login(values: LoginValues): Promise<AuthSession> {
  const data = await requestAuth("login", values);
  return toSession(data, values);
}

export async function register(values: RegisterValues): Promise<AuthSession> {
  const { confirmPassword: _confirmPassword, role, ...payload } = values;
  const data = await requestAuth("register", { ...payload, role });
  return toSession(data, values);
}

export function saveSession(session: AuthSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function loadSession(): AuthSession | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    const session = JSON.parse(raw) as AuthSession;
    return session?.user?.email ? session : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
