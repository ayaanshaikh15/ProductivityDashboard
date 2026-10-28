
import { LogOut, X } from "lucide-react";

export default function LogoutModal({
  isOpen,
  onCancel,
  onConfirm,
  loading = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-title"
        className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
            <LogOut size={22} />
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            aria-label="Close confirmation"
            className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/5 hover:text-white"
          >
            <X size={19} />
          </button>
        </div>

        <h2 id="logout-title" className="text-xl font-semibold text-white">
          Confirm Logout
        </h2>

        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Are you sure you want to log out of your account?
        </p>

        <div className="mt-7 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-white/5"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut size={16} />
            {loading ? "Logging out..." : "Confirm Logout"}
          </button>
        </div>
      </div>
    </div>
  );
}
