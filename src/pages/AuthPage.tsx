import { useMemo, useState } from "react";
import { BookOpen, Eye, EyeOff, LockKeyhole, Mail, User, UserCog } from "lucide-react";
import { ZodError } from "zod";
import { login, loginSchema, register, registerSchema } from "../lib/auth";
import type { AuthSession, UserRole } from "../types/auth";

interface AuthPageProps {
  onAuthenticated: (session: AuthSession) => void;
  isDark: boolean;
  onToggleDark: () => void;
}

type Mode = "login" | "register";
type FieldErrors = Record<string, string>;

function getErrors(error: unknown): FieldErrors {
  if (!(error instanceof ZodError)) return { form: error instanceof Error ? error.message : "Something went wrong" };

  return error.issues.reduce<FieldErrors>((acc, issue) => {
    const key = issue.path[0]?.toString() ?? "form";
    acc[key] = issue.message;
    return acc;
  }, {});
}

export default function AuthPage({ onAuthenticated, isDark, onToggleDark }: AuthPageProps) {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("user");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRegister = mode === "register";
  const roleCopy = useMemo(
    () =>
      role === "librarian"
        ? "Full catalog, member, loan, and event editing access."
        : "Browse books, request a loan, and view your own borrowing history.",
    [role]
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      const session = isRegister
        ? await register(registerSchema.parse({ name, email, password, confirmPassword, role }))
        : await login(loginSchema.parse({ email, password }));
      onAuthenticated(session);
    } catch (error) {
      setErrors(getErrors(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground grid lg:grid-cols-[minmax(360px,0.95fr)_1.05fr]" style={{ fontFamily: "var(--font-body)" }}>
      <section className="flex min-h-screen flex-col justify-between border-r border-border bg-card px-6 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-white">
              <BookOpen size={20} />
            </div>
            <div>
              <p className="font-semibold leading-tight text-foreground">Bibliotheca</p>
              <p className="text-xs text-muted-foreground">Library Management</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onToggleDark}
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            {isDark ? "Light" : "Dark"}
          </button>
        </div>

        <div className="mx-auto w-full max-w-md py-10">
          <div className="mb-7">
            <h1 className="text-3xl font-semibold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
              {isRegister ? "Create account" : "Welcome back"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to manage the library or access your personal borrowing account.
            </p>
          </div>

          <div className="mb-5 grid grid-cols-2 rounded-lg bg-secondary p-1">
            {(["login", "register"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setMode(item);
                  setErrors({});
                }}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  mode === item ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item === "login" ? "Login" : "Register"}
              </button>
            ))}
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {errors.form && <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{errors.form}</p>}

            {isRegister && (
              <label className="block text-sm">
                <span className="mb-1.5 block text-muted-foreground">Name</span>
                <span className="relative block">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="w-full rounded-md border border-border bg-input-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                    placeholder="Avery Stone"
                  />
                </span>
                {errors.name && <span className="mt-1 block text-xs text-destructive">{errors.name}</span>}
              </label>
            )}

            <label className="block text-sm">
              <span className="mb-1.5 block text-muted-foreground">Email</span>
              <span className="relative block">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-md border border-border bg-input-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                  placeholder="name@library.test"
                />
              </span>
              {errors.email && <span className="mt-1 block text-xs text-destructive">{errors.email}</span>}
            </label>

            <label className="block text-sm">
              <span className="mb-1.5 block text-muted-foreground">Password</span>
              <span className="relative block">
                <LockKeyhole size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type={showPassword ? "text" : "password"}
                  className="w-full rounded-md border border-border bg-input-background py-2 pl-9 pr-10 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </span>
              {errors.password && <span className="mt-1 block text-xs text-destructive">{errors.password}</span>}
            </label>

            {isRegister && (
              <>
                <label className="block text-sm">
                  <span className="mb-1.5 block text-muted-foreground">Confirm password</span>
                  <input
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    type={showPassword ? "text" : "password"}
                    className="w-full rounded-md border border-border bg-input-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                    placeholder="Repeat password"
                  />
                  {errors.confirmPassword && <span className="mt-1 block text-xs text-destructive">{errors.confirmPassword}</span>}
                </label>

                <div>
                  <span className="mb-2 block text-sm text-muted-foreground">Role</span>
                  <div className="grid grid-cols-2 gap-2">
                    {(["librarian", "user"] as const).map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setRole(item)}
                        className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm capitalize transition-colors ${
                          role === item
                            ? "border-accent bg-accent text-white"
                            : "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
                        }`}
                      >
                        <UserCog size={15} /> {item}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{roleCopy}</p>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Please wait..." : isRegister ? "Create account" : "Login"}
            </button>
          </form>

        </div>

        <p className="text-xs text-muted-foreground">Protected access for circulation, catalog, members, and events.</p>
      </section>

      <section className="hidden min-h-screen bg-primary text-primary-foreground lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary-foreground/60">Role Based Access</p>
          <h2 className="mt-5 max-w-xl text-5xl font-semibold leading-tight" style={{ fontFamily: "var(--font-display)" }}>
            Keep the catalog open while edit controls stay protected.
          </h2>
        </div>
        <div className="grid max-w-2xl grid-cols-2 gap-4">
          <div className="rounded-lg border border-white/10 bg-white/10 p-5">
            <p className="text-sm font-semibold">Librarian</p>
            <p className="mt-2 text-sm text-primary-foreground/70">Add and edit books, members, loans, and events.</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/10 p-5">
            <p className="text-sm font-semibold">User</p>
            <p className="mt-2 text-sm text-primary-foreground/70">Request available books and track personal borrowing.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
