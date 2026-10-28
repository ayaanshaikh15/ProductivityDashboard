
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  Target,
  CheckCircle2,
  Clock3,
  CalendarDays,
  RefreshCw,
  LoaderCircle,
  TrendingUp,
  ListTodo,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import toast from "react-hot-toast";
import api from "../services/api";
import Layout from "../components/layout/Layout";
import { useAuth } from "../context/AuthContext_temp";

const COLORS = ["#0066FF", "#A78BFA", "#F59E0B", "#10B981", "#F87171"];

const cardStyle =
  "rounded-2xl border border-white/10 bg-[#18181B] p-5 sm:p-6";

const toDateKey = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
};

const getLastSevenDays = () =>
  Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));

    return {
      date,
      key: toDateKey(date),
      day: date.toLocaleDateString("en-IN", { weekday: "short" }),
    };
  });

function StatCard({ title, value, subtitle, icon: Icon, color, percent }) {
  return (
    <div className={cardStyle}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-zinc-400">{title}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
            {value}
          </p>
          <p className="mt-2 text-xs text-zinc-500">{subtitle}</p>
        </div>
        <div className={`rounded-xl p-3 ${color}`}>
          <Icon size={21} />
        </div>
      </div>

      {percent !== undefined && (
        <div className="mt-5">
          <div className="mb-2 flex justify-between text-xs text-zinc-400">
            <span>Completion</span>
            <span>{percent}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[#0066FF] transition-all"
              style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-[#202024] px-3 py-2 shadow-xl">
      {label && <p className="mb-1 text-xs text-zinc-400">{label}</p>}
      {payload.map((item) => (
        <p key={item.dataKey} className="text-sm text-white">
          {item.name}: {item.value}
        </p>
      ))}
    </div>
  );
}

export default function Analytics() {
  const { logout } = useAuth();
  const [summary, setSummary] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchAnalytics = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    setError("");

    try {
      const [summaryResponse, tasksResponse, goalsResponse, scheduleResponse] =
        await Promise.all([
          api.get("/dashboard/summary"),
          api.get("/tasks"),
          api.get("/goals"),
          api.get("/schedule"),
        ]);

      setSummary(summaryResponse.data.summary);
      setTasks(tasksResponse.data.tasks ?? []);
      setGoals(goalsResponse.data.goals ?? []);
      setSchedules(scheduleResponse.data.schedules ?? []);
    } catch (err) {
      const message =
        err.response?.data?.message || "Unable to load analytics.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const taskStats = summary?.tasks;
  const goalStats = summary?.goals;
  const plannerStats = summary?.planner;

  const taskDistribution = useMemo(
    () => [
      { name: "Completed", value: taskStats?.completed ?? 0 },
      { name: "In Progress", value: taskStats?.inProgress ?? 0 },
      { name: "Pending", value: taskStats?.pending ?? 0 },
    ],
    [taskStats]
  );

  const priorityDistribution = useMemo(
    () =>
      ["High", "Medium", "Low"].map((priority) => ({
        name: priority,
        value: tasks.filter((task) => task.priority === priority).length,
      })),
    [tasks]
  );

  const weeklyActivity = useMemo(() => {
    const days = getLastSevenDays();

    return days.map(({ key, day }) => ({
      day,
      created: tasks.filter((task) => toDateKey(task.createdAt) === key).length,
      completed: tasks.filter(
        (task) =>
          task.status === "Completed" &&
          toDateKey(task.updatedAt) === key
      ).length,
    }));
  }, [tasks]);

  const totalScheduledHours = useMemo(() => {
    const totalMinutes = schedules.reduce((total, item) => {
      if (!item.startTime || !item.endTime) return total;

      const [startHours, startMinutes] = item.startTime.split(":").map(Number);
      const [endHours, endMinutes] = item.endTime.split(":").map(Number);

      const duration =
        endHours * 60 + endMinutes - (startHours * 60 + startMinutes);

      return total + (duration > 0 ? duration : 0);
    }, 0);

    return (totalMinutes / 60).toFixed(1);
  }, [schedules]);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      window.location.assign("/login");
    }
  };

  if (loading) {
    return (
      <Layout
        title="Analytics"
        subtitle="Understand your productivity and progress."
        onLogout={handleLogout}
      >
        <div className="flex min-h-72 items-center justify-center gap-3 text-zinc-400">
          <LoaderCircle className="animate-spin" size={24} />
          Loading analytics...
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Analytics"
      subtitle="Understand your productivity and progress."
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-semibold text-white">
              Productivity overview
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Insights from your current tasks, goals and schedule.
            </p>
          </div>

          <button
            onClick={() => fetchAnalytics(true)}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 self-start rounded-xl border border-white/10 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 disabled:opacity-50 sm:self-auto"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <p className="text-sm text-red-300">{error}</p>
            <button
              onClick={() => fetchAnalytics()}
              className="mt-2 text-sm text-white underline"
            >
              Try again
            </button>
          </div>
        )}

        {!error && summary && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Total tasks"
                value={taskStats.total}
                subtitle={`${taskStats.pending} pending`}
                icon={ListTodo}
                color="bg-blue-500/10 text-blue-400"
                percent={taskStats.completionRate}
              />

              <StatCard
                title="Completed tasks"
                value={taskStats.completed}
                subtitle={`${taskStats.completionRate}% completion rate`}
                icon={CheckCircle2}
                color="bg-emerald-500/10 text-emerald-400"
              />

              <StatCard
                title="Goals completed"
                value={`${goalStats.completed}/${goalStats.total}`}
                subtitle={`${goalStats.averageProgress}% average goal progress`}
                icon={Target}
                color="bg-violet-500/10 text-violet-400"
              />

              <StatCard
                title="Scheduled hours"
                value={`${totalScheduledHours}h`}
                subtitle={`${schedules.length} total schedule entries`}
                icon={Clock3}
                color="bg-amber-500/10 text-amber-400"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <section className={cardStyle}>
                <div className="mb-6">
                  <h3 className="font-semibold text-white">Weekly activity</h3>
                  <p className="mt-1 text-sm text-zinc-400">
                    Tasks created and tasks marked completed by day
                  </p>
                </div>

                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyActivity} barGap={5}>
                      <CartesianGrid
                        stroke="#303036"
                        strokeDasharray="3 3"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="day"
                        tick={{ fill: "#A1A1AA", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fill: "#A1A1AA", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend
                        wrapperStyle={{ color: "#A1A1AA", fontSize: 12 }}
                      />
                      <Bar
                        dataKey="created"
                        name="Created"
                        fill="#0066FF"
                        radius={[5, 5, 0, 0]}
                      />
                      <Bar
                        dataKey="completed"
                        name="Completed"
                        fill="#10B981"
                        radius={[5, 5, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className={cardStyle}>
                <div className="mb-2">
                  <h3 className="font-semibold text-white">Task status</h3>
                  <p className="mt-1 text-sm text-zinc-400">
                    How your tasks are distributed right now
                  </p>
                </div>

                {taskStats.total === 0 ? (
                  <div className="flex h-72 items-center justify-center text-sm text-zinc-500">
                    Create tasks to see your distribution.
                  </div>
                ) : (
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={taskDistribution.filter((item) => item.value > 0)}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="45%"
                          innerRadius={65}
                          outerRadius={95}
                          paddingAngle={4}
                        >
                          {taskDistribution
                            .filter((item) => item.value > 0)
                            .map((item) => (
                              <Cell
                                key={item.name}
                                fill={
                                  item.name === "Completed"
                                    ? "#10B981"
                                    : item.name === "In Progress"
                                      ? "#A78BFA"
                                      : "#0066FF"
                                }
                              />
                            ))}
                        </Pie>
                        <Tooltip content={<ChartTooltip />} />
                        <Legend
                          verticalAlign="bottom"
                          wrapperStyle={{ color: "#A1A1AA", fontSize: 12 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </section>

              <section className={cardStyle}>
                <div className="mb-6">
                  <h3 className="font-semibold text-white">Task priorities</h3>
                  <p className="mt-1 text-sm text-zinc-400">
                    Distribution of low, medium and high priority work
                  </p>
                </div>

                {tasks.length === 0 ? (
                  <div className="flex h-56 items-center justify-center text-sm text-zinc-500">
                    No tasks available yet.
                  </div>
                ) : (
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={priorityDistribution}
                        margin={{ top: 5, right: 8, left: -18, bottom: 5 }}
                      >
                        <CartesianGrid
                          stroke="#303036"
                          strokeDasharray="3 3"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: "#A1A1AA", fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          allowDecimals={false}
                          tick={{ fill: "#A1A1AA", fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip content={<ChartTooltip />} />
                        <Bar
                          dataKey="value"
                          name="Tasks"
                          radius={[6, 6, 0, 0]}
                        >
                          {priorityDistribution.map((item, index) => (
                            <Cell
                              key={item.name}
                              fill={COLORS[index]}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </section>

              <section className={cardStyle}>
                <div className="mb-6 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-white">Goal progress</h3>
                    <p className="mt-1 text-sm text-zinc-400">
                      Progress toward your personal goals
                    </p>
                  </div>
                  <TrendingUp className="text-violet-400" size={21} />
                </div>

                {goals.length === 0 ? (
                  <div className="flex h-56 items-center justify-center text-sm text-zinc-500">
                    Create a goal to start tracking progress.
                  </div>
                ) : (
                  <div className="max-h-64 space-y-5 overflow-y-auto pr-1">
                    {goals.map((goal) => (
                      <div key={goal._id}>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <p className="truncate text-sm font-medium text-zinc-200">
                            {goal.title}
                          </p>
                          <span className="shrink-0 text-xs text-zinc-400">
                            {goal.progress}%
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white/10">
                          <div
                            className={`h-full rounded-full transition-all ${
                              goal.status === "Completed"
                                ? "bg-emerald-500"
                                : "bg-violet-500"
                            }`}
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(0, Number(goal.progress) || 0)
                              )}%`,
                            }}
                          />
                        </div>
                        <p className="mt-1.5 text-xs text-zinc-500">
                          {goal.status}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <section className={cardStyle}>
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-400">
                  <Activity size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Productivity summary</h3>
                  <p className="mt-1 text-sm text-zinc-400">
                    A quick look at your current workload
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-white/5 bg-[#121214] p-4">
                  <p className="text-sm text-zinc-400">Tasks in progress</p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {taskStats.inProgress}
                  </p>
                </div>

                <div className="rounded-xl border border-white/5 bg-[#121214] p-4">
                  <p className="text-sm text-zinc-400">Tasks due today</p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {taskStats.dueToday}
                  </p>
                </div>

                <div className="rounded-xl border border-white/5 bg-[#121214] p-4">
                  <p className="text-sm text-zinc-400">Today's schedule</p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {plannerStats.completedToday}/{plannerStats.totalToday}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Events completed today
                  </p>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </Layout>
  );
}
