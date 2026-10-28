
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Plus,
  Pencil,
  Trash2,
  X,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import Layout from "../components/layout/Layout";
import { useAuth } from "../context/AuthContext_temp";

const emptyForm = {
  title: "",
  description: "",
  date: "",
  startTime: "09:00",
  endTime: "10:00",
  status: "Planned",
};

const statusStyles = {
  Planned: "border-blue-500/20 bg-blue-500/10 text-blue-300",
  Completed: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  Cancelled: "border-red-500/20 bg-red-500/10 text-red-300",
};

const pad = (number) => String(number).padStart(2, "0");

const toDateKey = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const formatDate = (date) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const formatTime = (time) => {
  if (!time) return "";
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
};

export default function Schedule() {
  const { logout } = useAuth();

  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchSchedules = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    setError("");

    try {
      const { data } = await api.get("/schedule");
      setSchedules(data.schedules ?? []);
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to load your schedule.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const monthDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const offset = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const totalCells = Math.ceil((offset + daysInMonth) / 7) * 7;

    return Array.from({ length: totalCells }, (_, index) => {
      const date = new Date(year, month, index - offset + 1);
      return {
        date,
        key: toDateKey(date),
        inMonth: date.getMonth() === month,
      };
    });
  }, [currentMonth]);

  const schedulesByDate = useMemo(() => {
    const grouped = {};

    schedules.forEach((schedule) => {
      if (!schedule.date) return;

      const key = toDateKey(new Date(schedule.date));
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(schedule);
    });

    Object.values(grouped).forEach((entries) => {
      entries.sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    return grouped;
  }, [schedules]);

  const selectedSchedules = schedulesByDate[selectedDate] ?? [];

  const monthScheduleCount = schedules.filter((schedule) => {
    const date = new Date(schedule.date);
    return (
      date.getFullYear() === currentMonth.getFullYear() &&
      date.getMonth() === currentMonth.getMonth()
    );
  }).length;

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, date: selectedDate });
    setModalOpen(true);
  };

  const openEdit = (schedule) => {
    setEditingId(schedule._id);
    setForm({
      title: schedule.title ?? "",
      description: schedule.description ?? "",
      date: toDateKey(new Date(schedule.date)),
      startTime: schedule.startTime ?? "09:00",
      endTime: schedule.endTime ?? "10:00",
      status: schedule.status ?? "Planned",
    });
    setModalOpen(true);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      toast.error("Please enter a title.");
      return;
    }

    if (form.startTime >= form.endTime) {
      toast.error("End time must be after start time.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
      };

      if (editingId) {
        const { data } = await api.patch(`/schedule/${editingId}`, payload);
        setSchedules((previous) =>
          previous.map((item) =>
            item._id === editingId ? data.schedule : item
          )
        );
        toast.success("Schedule updated.");
      } else {
        const { data } = await api.post("/schedule", payload);
        setSchedules((previous) => [...previous, data.schedule]);
        toast.success("Schedule created.");
      }

      setSelectedDate(form.date);
      setCurrentMonth(() => {
        const [year, month] = form.date.split("-").map(Number);
        return new Date(year, month - 1, 1);
      });
      setModalOpen(false);
      setEditingId(null);
      setForm(emptyForm);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Could not save this schedule."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (schedule) => {
    if (!window.confirm(`Delete "${schedule.title}" from your schedule?`)) {
      return;
    }

    setDeletingId(schedule._id);

    try {
      await api.delete(`/schedule/${schedule._id}`);
      setSchedules((previous) =>
        previous.filter((item) => item._id !== schedule._id)
      );
      toast.success("Schedule deleted.");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Could not delete this schedule."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const changeMonth = (amount) => {
    setCurrentMonth(
      (previous) =>
        new Date(previous.getFullYear(), previous.getMonth() + amount, 1)
    );
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      window.location.assign("/login");
    }
  };

  const todayKey = toDateKey(new Date());

  return (
    <Layout
      title="Schedule"
      subtitle="Plan your time and stay in control of your day."
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-zinc-400">
              {currentMonth.toLocaleDateString("en-IN", {
                month: "long",
                year: "numeric",
              })}
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-white">
              Your calendar
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              {monthScheduleCount} {monthScheduleCount === 1 ? "event" : "events"} this month
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                const today = new Date();
                setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
                setSelectedDate(todayKey);
              }}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-zinc-300 transition hover:bg-white/5"
            >
              Today
            </button>

            <button
              onClick={() => fetchSchedules(true)}
              disabled={refreshing}
              aria-label="Refresh schedule"
              className="rounded-xl border border-white/10 p-2.5 text-zinc-300 hover:bg-white/5"
            >
              <RefreshCw
                size={18}
                className={refreshing ? "animate-spin" : ""}
              />
            </button>

            <button
              onClick={openCreate}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#0066FF] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-600"
            >
              <Plus size={18} />
              Add event
            </button>
          </div>
        </div>

        {error && (
          <div className="flex flex-col gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-red-300">{error}</p>
            <button
              onClick={() => fetchSchedules()}
              className="text-sm font-medium text-red-200 hover:text-white"
            >
              Try again
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.8fr)]">
          <section className="min-w-0 rounded-2xl border border-white/10 bg-[#18181B] p-4 sm:p-6">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-400">
                  <CalendarDays size={21} />
                </div>
                <div>
                  <h3 className="font-semibold text-white">
                    {currentMonth.toLocaleDateString("en-IN", {
                      month: "long",
                      year: "numeric",
                    })}
                  </h3>
                  <p className="text-xs text-zinc-500">Select a date to view events</p>
                </div>
              </div>

              <div className="flex gap-1">
                <button
                  onClick={() => changeMonth(-1)}
                  aria-label="Previous month"
                  className="rounded-lg border border-white/10 p-2 text-zinc-300 hover:bg-white/5"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => changeMonth(1)}
                  aria-label="Next month"
                  className="rounded-lg border border-white/10 p-2 text-zinc-300 hover:bg-white/5"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="pb-2 text-center text-[10px] font-semibold uppercase tracking-wider text-zinc-500 sm:text-xs"
                >
                  {day}
                </div>
              ))}

              {monthDays.map(({ date, key, inMonth }) => {
                const dayEvents = schedulesByDate[key] ?? [];
                const isSelected = selectedDate === key;
                const isToday = todayKey === key;

                return (
                  <button
                    key={key}
                    onClick={() => setSelectedDate(key)}
                    aria-label={`${formatDate(key)}, ${dayEvents.length} events`}
                    aria-pressed={isSelected}
                    className={`relative flex min-h-[60px] flex-col items-center rounded-xl border p-1.5 transition sm:min-h-[86px] sm:p-2 ${
                      isSelected
                        ? "border-[#0066FF] bg-blue-500/15"
                        : "border-transparent hover:border-white/10 hover:bg-white/[0.03]"
                    } ${!inMonth ? "opacity-35" : ""}`}
                  >
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs sm:h-8 sm:w-8 sm:text-sm ${
                        isToday
                          ? "bg-[#0066FF] font-semibold text-white"
                          : isSelected
                            ? "font-semibold text-blue-300"
                            : "text-zinc-300"
                      }`}
                    >
                      {date.getDate()}
                    </span>

                    {dayEvents.length > 0 && (
                      <div className="mt-1 flex max-w-full flex-wrap justify-center gap-1">
                        {dayEvents.slice(0, 3).map((event) => (
                          <span
                            key={event._id}
                            className={`h-1.5 w-1.5 rounded-full ${
                              event.status === "Completed"
                                ? "bg-emerald-400"
                                : event.status === "Cancelled"
                                  ? "bg-red-400"
                                  : "bg-blue-400"
                            }`}
                          />
                        ))}
                        {dayEvents.length > 3 && (
                          <span className="text-[9px] text-zinc-500">
                            +{dayEvents.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-white/10 pt-4 text-xs text-zinc-400">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-400" />
                Planned
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Completed
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-400" />
                Cancelled
              </span>
            </div>
          </section>

          <section className="min-w-0 rounded-2xl border border-white/10 bg-[#18181B] p-4 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-blue-400">
                  Selected date
                </p>
                <h3 className="mt-2 text-lg font-semibold text-white">
                  {formatDate(selectedDate)}
                </h3>
                <p className="mt-1 text-sm text-zinc-500">
                  {selectedSchedules.length}{" "}
                  {selectedSchedules.length === 1 ? "event" : "events"}
                </p>
              </div>
              <button
                onClick={openCreate}
                aria-label="Add event on selected date"
                className="rounded-xl bg-blue-500/10 p-2.5 text-blue-300 transition hover:bg-blue-500/20"
              >
                <Plus size={20} />
              </button>
            </div>

            <div className="mt-6 space-y-3">
              {loading ? (
                <div className="flex min-h-40 items-center justify-center text-zinc-400">
                  <LoaderCircle size={22} className="animate-spin" />
                  <span className="ml-2 text-sm">Loading schedule...</span>
                </div>
              ) : selectedSchedules.length === 0 ? (
                <div className="flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 px-4 text-center">
                  <div className="rounded-full bg-white/5 p-4 text-zinc-400">
                    <CalendarDays size={24} />
                  </div>
                  <p className="mt-4 font-medium text-zinc-200">Nothing scheduled</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    Add an event to plan this day.
                  </p>
                  <button
                    onClick={openCreate}
                    className="mt-4 text-sm font-medium text-blue-400 hover:text-blue-300"
                  >
                    + Create an event
                  </button>
                </div>
              ) : (
                selectedSchedules.map((schedule) => (
                  <article
                    key={schedule._id}
                    className="rounded-xl border border-white/10 bg-[#121214] p-4 transition hover:border-white/20"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 w-1 shrink-0 self-stretch rounded-full bg-blue-500" />

                      <div className="min-w-0 flex-1">
                        <h4 className="break-words font-medium text-white">
                          {schedule.title}
                        </h4>

                        <p className="mt-2 flex items-center gap-2 text-xs text-zinc-400">
                          <Clock3 size={14} />
                          {formatTime(schedule.startTime)} –{" "}
                          {formatTime(schedule.endTime)}
                        </p>

                        {schedule.description && (
                          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-zinc-400">
                            {schedule.description}
                          </p>
                        )}

                        <span
                          className={`mt-3 inline-flex rounded-full border px-2.5 py-1 text-xs ${
                            statusStyles[schedule.status] ?? statusStyles.Planned
                          }`}
                        >
                          {schedule.status}
                        </span>

                        <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-3">
                          <button
                            onClick={() => openEdit(schedule)}
                            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-white/5 hover:text-white"
                          >
                            <Pencil size={13} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(schedule)}
                            disabled={deletingId === schedule._id}
                            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-red-300 hover:bg-red-500/10 disabled:opacity-50"
                          >
                            {deletingId === schedule._id ? (
                              <LoaderCircle size={13} className="animate-spin" />
                            ) : (
                              <Trash2 size={13} />
                            )}
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setModalOpen(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="schedule-modal-title"
            className="my-auto w-full max-w-lg rounded-2xl border border-white/10 bg-[#18181B] p-5 shadow-2xl sm:p-6"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h3 id="schedule-modal-title" className="text-xl font-semibold text-white">
                  {editingId ? "Edit event" : "Create event"}
                </h3>
                <p className="mt-1 text-sm text-zinc-400">
                  Add details to your personal schedule.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                disabled={saving}
                aria-label="Close dialog"
                className="rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="mb-2 block text-sm text-zinc-300">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  maxLength={200}
                  required
                  placeholder="e.g. Study React"
                  className="w-full rounded-xl border border-white/10 bg-[#121214] px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="description" className="mb-2 block text-sm text-zinc-300">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  rows={3}
                  placeholder="What do you plan to work on?"
                  className="w-full resize-y rounded-xl border border-white/10 bg-[#121214] px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="date" className="mb-2 block text-sm text-zinc-300">
                  Date <span className="text-red-400">*</span>
                </label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={handleFormChange}
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#121214] px-4 py-3 text-sm text-white outline-none focus:border-blue-500 [color-scheme:dark]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="startTime" className="mb-2 block text-sm text-zinc-300">
                    Start time
                  </label>
                  <input
                    id="startTime"
                    name="startTime"
                    type="time"
                    value={form.startTime}
                    onChange={handleFormChange}
                    required
                    className="w-full rounded-xl border border-white/10 bg-[#121214] px-3 py-3 text-sm text-white outline-none focus:border-blue-500 [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label htmlFor="endTime" className="mb-2 block text-sm text-zinc-300">
                    End time
                  </label>
                  <input
                    id="endTime"
                    name="endTime"
                    type="time"
                    value={form.endTime}
                    onChange={handleFormChange}
                    required
                    className="w-full rounded-xl border border-white/10 bg-[#121214] px-3 py-3 text-sm text-white outline-none focus:border-blue-500 [color-scheme:dark]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="status" className="mb-2 block text-sm text-zinc-300">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleFormChange}
                  className="w-full rounded-xl border border-white/10 bg-[#121214] px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                >
                  <option value="Planned">Planned</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-white/10 px-4 py-3 text-sm text-zinc-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#0066FF] px-5 py-3 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-60"
                >
                  {saving && <LoaderCircle size={16} className="animate-spin" />}
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save changes"
                      : "Create event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
