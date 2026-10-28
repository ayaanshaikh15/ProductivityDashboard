import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  Clock3,
  Edit3,
  Flag,
  LoaderCircle,
  Plus,
  Search,
  Target,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import api from "../services/api";
import Layout from "../components/layout/Layout";
import { useAuth } from "../context/AuthContext_temp";

const initialForm = {
  title: "",
  description: "",
  targetDate: "",
  progress: 0,
  status: "In Progress",
};

function formatDate(date) {
  if (!date) return "No target date";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "No target date";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function toDateInputValue(date) {
  if (!date) return "";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "";

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getProgress(goal) {
  const value = Number(goal.progress);

  if (Number.isNaN(value)) return 0;

  return Math.min(100, Math.max(0, value));
}

function isOverdue(goal) {
  if (!goal.targetDate || goal.status === "Completed") {
    return false;
  }

  const targetDate = new Date(goal.targetDate);
  const today = new Date();

  if (Number.isNaN(targetDate.getTime())) {
    return false;
  }

  targetDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return targetDate < today;
}

function StatCard({ title, value, description, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#18181B] p-5 transition hover:border-white/20">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-zinc-400">{title}</p>

        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5">
          <Icon size={19} className="text-blue-400" />
        </div>
      </div>

      <p className="mt-4 text-3xl font-semibold tracking-tight text-white">
        {value}
      </p>

      <p className="mt-1 text-xs text-zinc-500">{description}</p>
    </div>
  );
}

function GoalModal({ goal, onClose, onSave, saving }) {
  const [form, setForm] = useState(() => {
    if (!goal) {
      return initialForm;
    }

    return {
      title: goal.title ?? "",
      description: goal.description ?? "",
      targetDate: toDateInputValue(goal.targetDate),
      progress: getProgress(goal),
      status: goal.status ?? "In Progress",
    };
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleProgressChange = (event) => {
    let value = Number(event.target.value);

    if (Number.isNaN(value)) {
      value = 0;
    }

    value = Math.min(100, Math.max(0, value));

    setForm((previous) => ({
      ...previous,
      progress: value,
      status: value === 100 ? "Completed" : "In Progress",
    }));
  };

  const handleStatusChange = (event) => {
    const status = event.target.value;

    setForm((previous) => ({
      ...previous,
      status,
      progress: status === "Completed" ? 100 : previous.progress,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      toast.error("Please enter a goal title.");
      return;
    }

    let progress = Number(form.progress);

    if (Number.isNaN(progress)) {
      progress = 0;
    }

    progress = Math.min(100, Math.max(0, progress));

    const status = progress === 100 ? "Completed" : "In Progress";

    onSave({
      title: form.title.trim(),
      description: form.description.trim(),
      targetDate: form.targetDate || null,
      progress,
      status,
    });
  };

  const inputClass =
    "mt-2 w-full rounded-xl border border-white/10 bg-[#121212] px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-500";

  const labelClass = "text-sm font-medium text-zinc-300";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="goal-modal-title"
        className="my-auto w-full max-w-xl rounded-2xl border border-white/10 bg-[#18181B] shadow-2xl"
      >
        {/* Modal header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
          <div>
            <h2
              id="goal-modal-title"
              className="text-lg font-semibold text-white"
            >
              {goal ? "Edit goal" : "Create a goal"}
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              {goal
                ? "Update your goal and track your progress."
                : "Define something meaningful you want to accomplish."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close modal"
            className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/5 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
          <div>
            <label htmlFor="goal-title" className={labelClass}>
              Goal title *
            </label>

            <input
              id="goal-title"
              name="title"
              value={form.title}
              onChange={handleChange}
              maxLength={200}
              required
              autoFocus
              placeholder="e.g. Complete my portfolio"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="goal-description" className={labelClass}>
              Description
            </label>

            <textarea
              id="goal-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Describe what you want to achieve..."
              className={`${inputClass} resize-y`}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="goal-target-date" className={labelClass}>
                Target date
              </label>

              <input
                id="goal-target-date"
                name="targetDate"
                type="date"
                value={form.targetDate}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="goal-status" className={labelClass}>
                Status
              </label>

              <select
                id="goal-status"
                name="status"
                value={form.status}
                onChange={handleStatusChange}
                className={inputClass}
              >
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Progress */}
          <div>
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="goal-progress" className={labelClass}>
                Progress
              </label>

              <span className="text-sm font-semibold text-blue-400">
                {form.progress}%
              </span>
            </div>

            <input
              id="goal-progress"
              type="range"
              min="0"
              max="100"
              step="1"
              value={form.progress}
              onChange={handleProgressChange}
              className="mt-4 w-full accent-[#0066FF]"
            />

            <div className="mt-2 flex justify-between text-[11px] text-zinc-600">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-zinc-300 transition hover:bg-white/5"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0066FF] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-60"
            >
              {saving && (
                <LoaderCircle size={17} className="animate-spin" />
              )}

              {saving
                ? "Saving..."
                : goal
                  ? "Save changes"
                  : "Create goal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function GoalCard({ goal, onEdit, onDelete, onProgressChange, busy }) {
  const progress = getProgress(goal);
  const overdue = isOverdue(goal);

  return (
    <article className="rounded-2xl border border-white/10 bg-[#18181B] p-5 transition hover:border-white/20">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div
          className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
            goal.status === "Completed"
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
              : "border-blue-500/20 bg-blue-500/10 text-blue-400"
          }`}
        >
          {goal.status === "Completed" ? (
            <CheckCircle2 size={21} />
          ) : (
            <Target size={21} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h3
                className={`break-words text-lg font-semibold ${
                  goal.status === "Completed"
                    ? "text-zinc-400"
                    : "text-white"
                }`}
              >
                {goal.title}
              </h3>

              {goal.description && (
                <p className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-6 text-zinc-400">
                  {goal.description}
                </p>
              )}
            </div>

            <span
              className={`shrink-0 rounded-lg border px-2.5 py-1 text-xs font-medium ${
                goal.status === "Completed"
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                  : "border-blue-500/20 bg-blue-500/10 text-blue-400"
              }`}
            >
              {goal.status}
            </span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-zinc-400">Progress</span>

          <span className="text-sm font-semibold text-white">
            {progress}%
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-[#0066FF] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Quick progress buttons */}
      <div className="mt-4 flex flex-wrap gap-2">
        {[0, 25, 50, 75, 100].map((value) => (
          <button
            key={value}
            type="button"
            disabled={busy || progress === value}
            onClick={() => onProgressChange(goal, value)}
            className={`rounded-lg border px-2.5 py-1.5 text-xs transition ${
              progress === value
                ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
                : "border-white/10 bg-white/[0.03] text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-300"
            }`}
          >
            {value}%
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div
          className={`flex items-center gap-2 text-xs ${
            overdue ? "text-rose-400" : "text-zinc-500"
          }`}
        >
          <CalendarDays size={14} />

          <span>
            {overdue ? "Overdue · " : "Target · "}
            {formatDate(goal.targetDate)}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={busy}
            onClick={() => onEdit(goal)}
            className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/5 hover:text-blue-400 disabled:opacity-50"
            title="Edit goal"
            aria-label={`Edit ${goal.title}`}
          >
            <Edit3 size={17} />
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={() => onDelete(goal)}
            className="rounded-lg p-2 text-zinc-500 transition hover:bg-rose-500/10 hover:text-rose-400 disabled:opacity-50"
            title="Delete goal"
            aria-label={`Delete ${goal.title}`}
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>
    </article>
  );
}

export default function Goals() {
  const { logout } = useAuth();

  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyGoalId, setBusyGoalId] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      window.location.assign("/login");
    }
  };

  const fetchGoals = useCallback(async (showError = true) => {
    try {
      const { data } = await api.get("/goals");

      setGoals(Array.isArray(data.goals) ? data.goals : []);
    } catch (error) {
      console.error("Failed to fetch goals:", error);

      if (showError) {
        toast.error(
          error.response?.data?.message || "Unable to load your goals."
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const stats = useMemo(() => {
    const completed = goals.filter(
      (goal) => goal.status === "Completed"
    ).length;

    const active = goals.filter(
      (goal) => goal.status === "In Progress"
    ).length;

    const average =
      goals.length > 0
        ? Math.round(
            goals.reduce(
              (total, goal) => total + getProgress(goal),
              0
            ) / goals.length
          )
        : 0;

    return {
      total: goals.length,
      completed,
      active,
      average,
    };
  }, [goals]);

  const filteredGoals = useMemo(() => {
    const query = search.trim().toLowerCase();

    return goals.filter((goal) => {
      const matchesSearch =
        !query ||
        [goal.title, goal.description].some((value) =>
          String(value ?? "").toLowerCase().includes(query)
        );

      const matchesStatus =
        statusFilter === "All" || goal.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [goals, search, statusFilter]);

  const openCreateModal = () => {
    setEditingGoal(null);
    setModalOpen(true);
  };

  const openEditModal = (goal) => {
    setEditingGoal(goal);
    setModalOpen(true);
  };

  const handleSave = async (form) => {
    setSaving(true);

    try {
      if (editingGoal) {
        const { data } = await api.patch(
          `/goals/${editingGoal._id}`,
          form
        );

        if (data.goal) {
          setGoals((previous) =>
            previous.map((goal) =>
              goal._id === editingGoal._id ? data.goal : goal
            )
          );
        } else {
          await fetchGoals(false);
        }

        toast.success(data.message || "Goal updated successfully.");
      } else {
        const { data } = await api.post("/goals", form);

        if (data.goal) {
          setGoals((previous) => [data.goal, ...previous]);
        } else {
          await fetchGoals(false);
        }

        toast.success(data.message || "Goal created successfully.");
      }

      setModalOpen(false);
      setEditingGoal(null);
    } catch (error) {
      console.error("Failed to save goal:", error);

      toast.error(
        error.response?.data?.message || "Unable to save this goal."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleProgressChange = async (goal, progress) => {
    setBusyGoalId(goal._id);

    try {
      const status = progress === 100 ? "Completed" : "In Progress";

      const { data } = await api.patch(`/goals/${goal._id}`, {
        progress,
        status,
      });

      if (data.goal) {
        setGoals((previous) =>
          previous.map((item) =>
            item._id === goal._id ? data.goal : item
          )
        );
      } else {
        await fetchGoals(false);
      }

      toast.success(
        progress === 100
          ? "Goal completed!"
          : `Goal progress updated to ${progress}%.`
      );
    } catch (error) {
      console.error("Failed to update goal:", error);

      toast.error(
        error.response?.data?.message || "Unable to update goal progress."
      );
    } finally {
      setBusyGoalId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);

    try {
      const { data } = await api.delete(
        `/goals/${deleteTarget._id}`
      );

      setGoals((previous) =>
        previous.filter((goal) => goal._id !== deleteTarget._id)
      );

      toast.success(data.message || "Goal deleted successfully.");

      setDeleteTarget(null);
    } catch (error) {
      console.error("Failed to delete goal:", error);

      toast.error(
        error.response?.data?.message || "Unable to delete this goal."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Layout
      title="Goals"
      subtitle="Track your progress toward the things that matter."
      onLogout={handleLogout}
    >
      <div className="space-y-7 pb-8">
        {/* Page heading */}
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-zinc-400">
              Turn your ambitions into measurable progress.
            </p>

            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Your goals
            </h2>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0066FF] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-950/20 transition hover:bg-blue-600"
          >
            <Plus size={18} />
            Add new goal
          </button>
        </section>

        {/* Statistics */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total goals"
            value={stats.total}
            description="All your goals"
            icon={Target}
          />

          <StatCard
            title="In progress"
            value={stats.active}
            description="Goals you're working on"
            icon={TrendingUp}
          />

          <StatCard
            title="Completed"
            value={stats.completed}
            description="Successfully achieved"
            icon={CheckCircle2}
          />

          <StatCard
            title="Average progress"
            value={`${stats.average}%`}
            description="Across all goals"
            icon={Flag}
          />
        </section>

        {/* Filters */}
        <section className="rounded-2xl border border-white/10 bg-[#18181B] p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search goals..."
                aria-label="Search goals"
                className="w-full rounded-xl border border-white/10 bg-[#121212] py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-blue-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter goals by status"
              className="rounded-xl border border-white/10 bg-[#121212] px-4 py-3 text-sm text-zinc-300 outline-none focus:border-blue-500 sm:w-48"
            >
              <option value="All">All goals</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
            <p className="text-xs text-zinc-500">
              Showing{" "}
              <span className="font-medium text-zinc-300">
                {filteredGoals.length}
              </span>{" "}
              of {goals.length} goals
            </p>

            {(search || statusFilter !== "All") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("All");
                }}
                className="text-xs font-medium text-blue-400 transition hover:text-blue-300"
              >
                Clear filters
              </button>
            )}
          </div>
        </section>

        {/* Goals */}
        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-white">
              All goals
            </h3>

            <span className="text-xs text-zinc-500">
              Newest goals first
            </span>
          </div>

          {loading ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-[#18181B]">
              <LoaderCircle
                size={28}
                className="animate-spin text-blue-400"
              />

              <p className="text-sm text-zinc-400">
                Loading your goals...
              </p>
            </div>
          ) : filteredGoals.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#18181B] px-5 py-12 text-center">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <Target size={27} className="text-zinc-400" />
              </div>

              <h3 className="mt-4 text-lg font-semibold text-white">
                {goals.length === 0
                  ? "No goals yet"
                  : "No matching goals"}
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
                {goals.length === 0
                  ? "Set your first goal and start tracking your progress."
                  : "Try changing your search or status filter."}
              </p>

              {goals.length === 0 ? (
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0066FF] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600"
                >
                  <Plus size={17} />
                  Create your first goal
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("All");
                  }}
                  className="mt-5 text-sm font-medium text-blue-400 hover:text-blue-300"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
              {filteredGoals.map((goal) => (
                <GoalCard
                  key={goal._id}
                  goal={goal}
                  onEdit={openEditModal}
                  onDelete={setDeleteTarget}
                  onProgressChange={handleProgressChange}
                  busy={busyGoalId === goal._id}
                />
              ))}
            </div>
          )}
        </section>

        {/* Create / edit modal */}
        {modalOpen && (
          <GoalModal
            key={editingGoal?._id ?? "new-goal"}
            goal={editingGoal}
            onClose={() => {
              if (saving) return;

              setModalOpen(false);
              setEditingGoal(null);
            }}
            onSave={handleSave}
            saving={saving}
          />
        )}

        {/* Delete confirmation */}
        {deleteTarget && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="delete-goal-title"
              className="w-full max-w-md rounded-2xl border border-white/10 bg-[#18181B] p-6 shadow-2xl"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
                <Trash2 size={23} />
              </div>

              <h3
                id="delete-goal-title"
                className="mt-4 text-lg font-semibold text-white"
              >
                Delete this goal?
              </h3>

              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Are you sure you want to delete{" "}
                <span className="font-medium text-zinc-200">
                  "{deleteTarget.title}"
                </span>
                ? This action cannot be undone.
              </p>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setDeleteTarget(null)}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-white/5"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleDelete}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:opacity-60"
                >
                  {deleting ? (
                    <LoaderCircle
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <Trash2 size={16} />
                  )}

                  {deleting ? "Deleting..." : "Delete goal"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}