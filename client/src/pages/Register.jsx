
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext_temp";

export default function Register() {
  const { register, user, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await register(form);
      toast.success("Account created successfully!");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to create account."
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
          <h1 className="text-3xl font-bold">Create account</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Start organizing your work with ZidioTask.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              Full name
            </label>
            <input
              type="text"
              required
              autoComplete="name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              placeholder="Enter your name"
              className="w-full rounded-xl border border-white/10 bg-[#121212] px-4 py-3 text-sm outline-none focus:border-[#0066FF]"
            />
          </div>

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
              className="w-full rounded-xl border border-white/10 bg-[#121212] px-4 py-3 text-sm outline-none focus:border-[#0066FF]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              placeholder="At least 6 characters"
              className="w-full rounded-xl border border-white/10 bg-[#121212] px-4 py-3 text-sm outline-none focus:border-[#0066FF]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-[#0066FF] px-4 py-3 font-semibold transition hover:bg-blue-600 disabled:opacity-60"
          >
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-[#4D91FF] hover:text-white"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
