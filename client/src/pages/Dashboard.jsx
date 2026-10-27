
import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  CircleDashed,
  Clock3,
  Target,
  CalendarDays,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/layout/Layout";
import { useAuth } from "../context/AuthContext_temp";

function StatCard({ title, value, description, icon: Icon, color }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#18181B] p-5 transition hover:border-white/20">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-zinc-400">{title}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-white">
            {value ?? 0}
          </p>
          <p className="mt-2 text-xs text-zinc-500">{description}</p>
        </div>

        <div className={`rounded-xl p-3 ${color}`}>
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, subtitle, action, children }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#18181B] p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-white">{title}</h2>
          <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
        </div>

        {action}
      </div>

      {children}
    </section>
  );
}

function EmptyState({ message }) {
  return (
    <div className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center">
      <CircleDashed className="mx-auto mb-3 text-zinc-600" size={28} />
      <p className="text-sm text-zinc-400">{message}</p>
    </div>
  );
}

function formatDate(date) {
  if (!date) return "No due date";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Invalid date";

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }) {
  const styles = {
    Completed: "bg-emerald-500/10 text-emerald-400",
    "In Progress": "bg-blue-500/10 text-blue-400",
    Pending: "bg-amber-500/10 text-amber-400",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        styles[status] || "bg-white/5 text-zinc-400"
      }`}
    >
      {status || "Unknown"}
    </span>
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get("/dashboard/summary");

      if (data.success === false) {
        throw new Error(data.message || "Could not load dashboard.");
      }

      setDashboard(data);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Unable to load dashboard data.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const summary = dashboard?.summary || {};
  const tasks = summary.tasks || {};
  const goals = summary.goals || {};
  const planner = summary.planner || {};

  const todayTasks = dashboard?.todayTasks || [];
  const todaySchedules = dashboard?.todaySchedules || [];
  const recentTasks = dashboard?.recentTasks || [];

  const completionRate = Math.min(
    100,
    Math.max(0, Number(tasks.completionRate) || 0)
  );

  const handleRetry = async () => {
    await fetchDashboard();
  };

  return (
    <Layout
      title="Dashboard"
      subtitle={`Welcome back${user?.name ? `, ${user.name}` : ""}. Here's your productivity overview.`}
      onLogout={async () => {
        try {
          const { logout } = await import("../context/AuthContext_temp");
          // Logout is handled by the shared layout's callback in App.jsx.
          toast.error("Please use the sidebar logout action.");
        } catch {
          toast.error("Unable to log out.");
        }
      }}
    >
      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-36 animate-pulse rounded-2xl border border-white/10 bg-[#18181B]"
            />
          ))}
          <div className="h-64 animate-pulse rounded-2xl border border-white/10 bg-[#18181B] sm:col-span-2 xl:col-span-4" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/20 bg-[#18181B] p-8 text-center">
          <p className="font-medium text-white">
            Couldn't load your dashboard
          </p>
          <p className="mt-2 text-sm text-zinc-400">{error}</p>

          <button
            onClick={handleRetry}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0066FF] px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-600"
          >
            <RefreshCw size={16} />
            Try again
          </button>
        </div>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Your overview
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Track your tasks and progress in one place.
              </p>
            </div>

            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#18181B] px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/5"
            >
              <RefreshCw size={15} />
              Refresh
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Tasks"
              value={tasks.total}
              description="All your tasks"
              icon={CircleDashed}
              color="bg-blue-500/10 text-blue-400"
            />

            <StatCard
              title="Completed"
              value={tasks.completed}
              description="Tasks finished"
              icon={CheckCircle2}
              color="bg-emerald-500/10 text-emerald-400"
            />

            <StatCard
              title="In Progress"
              value={tasks.inProgress}
              description="Tasks you're working on"
              icon={Clock3}
              color="bg-amber-500/10 text-amber-400"
            />

            <StatCard
              title="Total Goals"
              value={goals.total}
              description="Goals you're tracking"
              icon={Target}
              color="bg-purple-500/10 text-purple-400"
            />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-3">
            <div className="space-y-6 xl:col-span-2">
              <SectionCard
                title="Task completion"
                subtitle="Your overall task progress"
                action={
                  <Link
                    to="/tasks"
                    className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
                  >
                    View tasks <ArrowUpRight size={15} />
                  </Link>
                }
              >
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-4xl font-bold text-white">
                      {completionRate}%
                    </p>
                    <p className="mt-2 text-sm text-zinc-400">
                      {tasks.completed ?? 0} of {tasks.total ?? 0} tasks
                      completed
                    </p>
                  </div>
                  <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                    <CheckCircle2 size={24} />
                  </div>
                </div>

                <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-[#0066FF] transition-all duration-500"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-[#121212] p-3">
                    <p className="text-xs text-zinc-500">Pending</p>
                    <p className="mt-1 text-lg font-semibold text-amber-400">
                      {tasks.pending ?? 0}
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#121212] p-3">
                    <p className="text-xs text-zinc-500">Due today</p>
                    <p className="mt-1 text-lg font-semibold text-white">
                      {tasks.dueToday ?? 0}
                    </p>
                  </div>
                  <div className="col-span-2 rounded-xl bg-[#121212] p-3 sm:col-span-1">
                    <p className="text-xs text-zinc-500">Goal progress</p>
                    <p className="mt-1 text-lg font-semibold text-purple-400">
                      {goals.averageProgress ?? 0}%
                    </p>
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                title="Today's tasks"
                subtitle="Tasks scheduled for today"
                action={
                  <Link
                    to="/tasks"
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    View all
                  </Link>
                }
              >
                {todayTasks.length === 0 ? (
                  <EmptyState message="No tasks due today." />
                ) : (
                  <div className="space-y-3">
                    {todayTasks.map((task) => (
                      <div
                        key={task._id || task.id || task.title}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/5 bg-[#121212] p-4"
                      >
                        <div className="flex min-w-0 items-start gap-3">
                          <CheckCircle2
                            size={19}
                            className="mt-0.5 shrink-0 text-zinc-500"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-white">
                              {task.title}
                            </p>
                            <p className="mt-1 text-xs text-zinc-500">
                              {task.priority || "Normal priority"}
                              {task.dueDate
                                ? ` · ${formatDate(task.dueDate)}`
                                : ""}
                            </p>
                          </div>
                        </div>

                        <StatusBadge status={task.status} />
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>

              <SectionCard
                title="Recent tasks"
                subtitle="Your latest task activity"
                action={
                  <Link
                    to="/tasks"
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    View all
                  </Link>
                }
              >
                {recentTasks.length === 0 ? (
                  <EmptyState message="No recent tasks found." />
                ) : (
                  <div className="space-y-3">
                    {recentTasks.map((task) => (
                      <div
                        key={task._id || task.id || task.title}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/5 bg-[#121212] p-4"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-white">
                            {task.title}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            {task.category || "General"}
                            {task.dueDate
                              ? ` · Due ${formatDate(task.dueDate)}`
                              : ""}
                          </p>
                        </div>
                        <StatusBadge status={task.status} />
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
            </div>

            <div className="space-y-6">
              <SectionCard
                title="Today's schedule"
                subtitle="Your planned activities"
              >
                {todaySchedules.length === 0 ? (
                  <EmptyState message="No scheduled activities for today." />
                ) : (
                  <div className="space-y-4">
                    {todaySchedules.map((item) => (
                      <div
                        key={item._id || item.id || item.title}
                        className="flex gap-3"
                      >
                        <div className="mt-1 h-9 w-1 shrink-0 rounded-full bg-[#0066FF]" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-white">
                            {item.title}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            {item.startTime || "Time not set"}
                            {item.endTime ? ` – ${item.endTime}` : ""}
                          </p>
                          {item.description && (
                            <p className="mt-2 text-sm text-zinc-400">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Link
                  to="/schedule"
                  className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-white/10 py-2.5 text-sm text-zinc-300 transition hover:bg-white/5"
                >
                  <CalendarDays size={16} />
                  Open schedule
                </Link>
              </SectionCard>

              <SectionCard
                title="Goal progress"
                subtitle="Your overall goal performance"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400">
                    <Target size={27} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {goals.averageProgress ?? 0}%
                    </p>
                    <p className="text-sm text-zinc-400">
                      Average progress
                    </p>
                  </div>
                </div>

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-purple-500 transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(0, Number(goals.averageProgress) || 0)
                      )}%`,
                    }}
                  />
                </div>

                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Completed goals</span>
                  <span className="font-medium text-white">
                    {goals.completed ?? 0} / {goals.total ?? 0}
                  </span>
                </div>

                <Link
                  to="/goals"
                  className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-[#0066FF]/10 py-2.5 text-sm font-medium text-blue-400 transition hover:bg-[#0066FF]/20"
                >
                  Manage goals <ArrowUpRight size={16} />
                </Link>
              </SectionCard>

              <SectionCard
                title="Daily planner"
                subtitle="Today's planning progress"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-zinc-400">
                    Activities completed
                  </span>
                  <span className="font-semibold text-white">
                    {planner.completedToday ?? 0} / {planner.totalToday ?? 0}
                  </span>
                </div>

                <p className="mt-3 text-xs text-zinc-500">
                  Keep moving forward, one task at a time.
                </p>
              </SectionCard>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
