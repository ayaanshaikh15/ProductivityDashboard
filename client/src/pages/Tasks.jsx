
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  Filter,
  ListTodo,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import api from "../services/api";
import Layout from "../components/layout/Layout";
import { useAuth } from "../context/AuthContext_temp";

const initialForm = {
  title: "",
  description: "",
  category: "Personal",
  priority: "Medium",
  status: "Pending",
  dueDate: "",
};

const statusOptions = ["Pending", "In Progress", "Completed"];
const priorityOptions = ["Low", "Medium", "High"];

const priorityStyles = {
  Low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  High: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

const statusStyles = {
  Pending: "bg-zinc-500/10 text-zinc-300 border-zinc-500/20",
  "In Progress": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

function formatDate(date) {
  if (!date) return "No due date";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "No due date";

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

function isOverdue(task) {
  if (!task.dueDate || task.status === "Completed") return false;

  const due = new Date(task.dueDate);
  const today = new Date();

  if (Number.isNaN(due.getTime())) return false;

  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return due < today;
}

function StatCard({ title, value, icon: Icon, description }) {
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

function TaskModal({ task, onClose, onSave, saving }) {
  const [form, setForm] = useState(() => ({
    ...initialForm,
    ...(task
      ? {
          title: task.title ?? "",
          description: task.description ?? "",
          category: task.category ?? "Personal",
          priority: task.priority ?? "Medium",
          status: task.status ?? "Pending",
          dueDate: toDateInputValue(task.dueDate),
        }
      : {}),
  }));

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      toast.error("Please enter a task title.");
      return;
    }

    onSave({
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category.trim() || "Personal",
      dueDate: form.dueDate || null,
    });
  };

  const inputClass =
    "mt-2 w-full rounded-xl border border-white/10 bg-[#121212] px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-500";

  const labelClass = "text-sm font-medium text-zinc-300";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
        className="my-auto w-full max-w-xl rounded-2xl border border-white/10 bg-[#18181B] shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
          <div>
            <h2 id="task-modal-title" className="text-lg font-semibold text-white">
              {task ? "Edit task" : "Create a task"}
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              {task
                ? "Update your task details."
                : "Add a new task to your workspace."}
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

        <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
          <div>
            <label className={labelClass} htmlFor="task-title">
              Task title *
            </label>

            <input
              id="task-title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Complete React project"
              maxLength={200}
              required
              autoFocus
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="task-description">
              Description
            </label>

            <textarea
              id="task-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="What needs to be done?"
              rows={3}
              className={`${inputClass} resize-y`}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="task-category">
                Category
              </label>

              <input
                id="task-category"
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="Personal, Work, Study..."
                maxLength={100}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="task-due-date">
                Due date
              </label>

              <input
                id="task-due-date"
                name="dueDate"
                type="date"
                value={form.dueDate}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="task-priority">
                Priority
              </label>

              <select
                id="task-priority"
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className={inputClass}
              >
                {priorityOptions.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass} htmlFor="task-status">
                Status
              </label>

              <select
                id="task-status"
                name="status"
                value={form.status}
                onChange={handleChange}
                className={inputClass}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

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
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0066FF] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && <LoaderCircle size={17} className="animate-spin" />}
              {saving
                ? "Saving..."
                : task
                  ? "Save changes"
                  : "Create task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TaskCard({ task, onEdit, onDelete, onStatusChange, busy }) {
  const overdue = isOverdue(task);

  return (
    <article className="group rounded-2xl border border-white/10 bg-[#18181B] p-5 transition hover:border-white/20">
      <div className="flex items-start gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() =>
            onStatusChange(
              task,
              task.status === "Completed" ? "Pending" : "Completed"
            )
          }
          aria-label={
            task.status === "Completed"
              ? "Mark task as pending"
              : "Mark task as completed"
          }
          title={
            task.status === "Completed"
              ? "Mark as pending"
              : "Mark as completed"
          }
          className="mt-0.5 shrink-0 rounded-full text-zinc-500 transition hover:text-blue-400 disabled:opacity-50"
        >
          {task.status === "Completed" ? (
            <CheckCircle2 size={22} className="text-emerald-400" />
          ) : (
            <Circle size={22} />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <h3
            className={`break-words font-semibold ${
              task.status === "Completed"
                ? "text-zinc-500 line-through"
                : "text-white"
            }`}
          >
            {task.title}
          </h3>

          {task.description && (
            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-zinc-400">
              {task.description}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-lg border px-2.5 py-1 text-xs font-medium ${
                priorityStyles[task.priority] ?? priorityStyles.Medium
              }`}
            >
              {task.priority}
            </span>

            <span
              className={`rounded-lg border px-2.5 py-1 text-xs font-medium ${
                statusStyles[task.status] ?? statusStyles.Pending
              }`}
            >
              {task.status}
            </span>

            <span className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-zinc-400">
              {task.category || "Personal"}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            <CalendarDays size={14} className={overdue ? "text-rose-400" : "text-zinc-500"} />

            <span className={overdue ? "font-medium text-rose-400" : "text-zinc-500"}>
              {overdue ? "Overdue · " : ""}
              {formatDate(task.dueDate)}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(task)}
            disabled={busy}
            aria-label={`Edit ${task.title}`}
            title="Edit task"
            className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/5 hover:text-blue-400 disabled:opacity-50"
          >
            <Pencil size={17} />
          </button>

          <button
            type="button"
            onClick={() => onDelete(task)}
            disabled={busy}
            aria-label={`Delete ${task.title}`}
            title="Delete task"
            className="rounded-lg p-2 text-zinc-500 transition hover:bg-rose-500/10 hover:text-rose-400 disabled:opacity-50"
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>
    </article>
  );
}

export default function Tasks() {
  const { logout } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyTaskId, setBusyTaskId] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

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

  const fetchTasks = useCallback(async (showError = true) => {
    try {
      const { data } = await api.get("/tasks");
      setTasks(Array.isArray(data.tasks) ? data.tasks : []);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);

      if (showError) {
        toast.error(
          error.response?.data?.message || "Unable to load your tasks."
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const stats = useMemo(() => {
    const completed = tasks.filter(
      (task) => task.status === "Completed"
    ).length;

    const inProgress = tasks.filter(
      (task) => task.status === "In Progress"
    ).length;

    const pending = tasks.filter(
      (task) => task.status === "Pending"
    ).length;

    return {
      total: tasks.length,
      completed,
      inProgress,
      pending,
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesSearch =
        !query ||
        [task.title, task.description, task.category]
          .some((value) => String(value ?? "").toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "All" || task.status === statusFilter;

      const matchesPriority =
        priorityFilter === "All" || task.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, search, statusFilter, priorityFilter]);

  const openCreateModal = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleSave = async (form) => {
    setSaving(true);

    try {
      if (editingTask) {
        const { data } = await api.patch(
          `/tasks/${editingTask._id}`,
          form
        );

        if (data.task) {
          setTasks((previous) =>
            previous.map((task) =>
              task._id === editingTask._id ? data.task : task
            )
          );
        } else {
          await fetchTasks(false);
        }

        toast.success(data.message || "Task updated successfully.");
      } else {
        const { data } = await api.post("/tasks", form);

        if (data.task) {
          setTasks((previous) => [data.task, ...previous]);
        } else {
          await fetchTasks(false);
        }

        toast.success(data.message || "Task created successfully.");
      }

      setModalOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error("Failed to save task:", error);

      toast.error(
        error.response?.data?.message || "Unable to save this task."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (task, status) => {
    setBusyTaskId(task._id);

    try {
      const { data } = await api.patch(`/tasks/${task._id}`, { status });

      if (data.task) {
        setTasks((previous) =>
          previous.map((item) =>
            item._id === task._id ? data.task : item
          )
        );
      } else {
        await fetchTasks(false);
      }

      toast.success(
        status === "Completed"
          ? "Task completed!"
          : "Task moved to pending."
      );
    } catch (error) {
      console.error("Failed to update task status:", error);

      toast.error(
        error.response?.data?.message || "Unable to update task status."
      );
    } finally {
      setBusyTaskId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);

    try {
      const { data } = await api.delete(`/tasks/${deleteTarget._id}`);

      setTasks((previous) =>
        previous.filter((task) => task._id !== deleteTarget._id)
      );

      toast.success(data.message || "Task deleted successfully.");
      setDeleteTarget(null);
    } catch (error) {
      console.error("Failed to delete task:", error);

      toast.error(
        error.response?.data?.message || "Unable to delete this task."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Layout
      title="Tasks"
      subtitle="Organize your work and make progress every day."
      onLogout={handleLogout}
    >
      <div className="space-y-7 pb-8">
        {/* Page heading */}
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-zinc-400">
              Keep your priorities clear and your work moving.
            </p>

            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Your tasks
            </h2>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0066FF] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-950/20 transition hover:bg-blue-600"
          >
            <Plus size={18} />
            Add new task
          </button>
        </section>

        {/* Statistics */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total tasks"
            value={stats.total}
            icon={ListTodo}
            description="All your tasks"
          />

          <StatCard
            title="Pending"
            value={stats.pending}
            icon={Clock3}
            description="Waiting to be started"
          />

          <StatCard
            title="In progress"
            value={stats.inProgress}
            icon={AlertTriangle}
            description="Currently in progress"
          />

          <StatCard
            title="Completed"
            value={stats.completed}
            icon={CheckCircle2}
            description="Successfully finished"
          />
        </section>

        {/* Filters */}
        <section className="rounded-2xl border border-white/10 bg-[#18181B] p-4 sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tasks, descriptions, categories..."
                aria-label="Search tasks"
                className="w-full rounded-xl border border-white/10 bg-[#121212] py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-blue-500"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1 sm:min-w-40">
                <Filter
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                />

                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  aria-label="Filter by status"
                  className="w-full appearance-none rounded-xl border border-white/10 bg-[#121212] py-3 pl-9 pr-3 text-sm text-zinc-300 outline-none focus:border-blue-500"
                >
                  <option value="All">All statuses</option>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={priorityFilter}
                onChange={(event) => setPriorityFilter(event.target.value)}
                aria-label="Filter by priority"
                className="flex-1 rounded-xl border border-white/10 bg-[#121212] px-3 py-3 text-sm text-zinc-300 outline-none focus:border-blue-500 sm:min-w-36"
              >
                <option value="All">All priorities</option>
                {priorityOptions.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority} priority
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
            <p className="text-xs text-zinc-500">
              Showing{" "}
              <span className="font-medium text-zinc-300">
                {filteredTasks.length}
              </span>{" "}
              of {tasks.length} tasks
            </p>

            {(search || statusFilter !== "All" || priorityFilter !== "All") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("All");
                  setPriorityFilter("All");
                }}
                className="text-xs font-medium text-blue-400 transition hover:text-blue-300"
              >
                Clear filters
              </button>
            )}
          </div>
        </section>

        {/* Task list */}
        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-white">
              All tasks
            </h3>

            <span className="text-xs text-zinc-500">
              Newest tasks first
            </span>
          </div>

          {loading ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-[#18181B]">
              <LoaderCircle size={28} className="animate-spin text-blue-400" />
              <p className="text-sm text-zinc-400">Loading your tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#18181B] px-5 py-12 text-center">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <ListTodo size={27} className="text-zinc-400" />
              </div>

              <h3 className="mt-4 text-lg font-semibold text-white">
                {tasks.length === 0
                  ? "No tasks yet"
                  : "No matching tasks"}
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
                {tasks.length === 0
                  ? "Start organizing your day by creating your first task."
                  : "Try changing your search or filters to find your tasks."}
              </p>

              {tasks.length === 0 ? (
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0066FF] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600"
                >
                  <Plus size={17} />
                  Create your first task
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("All");
                    setPriorityFilter("All");
                  }}
                  className="mt-5 text-sm font-medium text-blue-400 hover:text-blue-300"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onEdit={openEditModal}
                  onDelete={setDeleteTarget}
                  onStatusChange={handleStatusChange}
                  busy={busyTaskId === task._id}
                />
              ))}
            </div>
          )}
        </section>

        {/* Create / edit modal */}
        {modalOpen && (
          <TaskModal
            key={editingTask?._id ?? "new-task"}
            task={editingTask}
            onClose={() => {
              if (saving) return;
              setModalOpen(false);
              setEditingTask(null);
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
              aria-labelledby="delete-task-title"
              className="w-full max-w-md rounded-2xl border border-white/10 bg-[#18181B] p-6 shadow-2xl"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
                <Trash2 size={23} />
              </div>

              <h3
                id="delete-task-title"
                className="mt-4 text-lg font-semibold text-white"
              >
                Delete this task?
              </h3>

              <p className="mt-2 break-words text-sm leading-6 text-zinc-400">
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
                    <LoaderCircle size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                  {deleting ? "Deleting..." : "Delete task"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
