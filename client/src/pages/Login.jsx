
import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext_temp";

export default function Login() {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await login(form);
      toast.success("Login successful!");
      navigate(location.state?.from?.pathname || "/dashboard", {
        replace: true,
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to log in."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#121212] px-4 py-10 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#18181B] p-6 shadow-2xl sm:p-8">
        <div className="mb-8">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#0066FF] text-xl font-bold">
            Z
          </div>
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Sign in to your ZidioTask workspace.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              Email address
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              placeholder="you@example.com"
              className="w-full rounded-xl border border-white/10 bg-[#121212] px-4 py-3 text-sm outline-none transition focus:border-[#0066FF]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              Password
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              placeholder="Enter your password"
              className="w-full rounded-xl border border-white/10 bg-[#121212] px-4 py-3 text-sm outline-none transition focus:border-[#0066FF]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-[#0066FF] px-4 py-3 font-semibold transition hover:bg-blue-600 disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-[#4D91FF] hover:text-white"
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
