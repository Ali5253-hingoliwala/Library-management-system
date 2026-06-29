export type UserRole = "admin" | "librarian" | "staff" | "user";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthSession {
  accessToken?: string;
  user: AuthUser;
}
