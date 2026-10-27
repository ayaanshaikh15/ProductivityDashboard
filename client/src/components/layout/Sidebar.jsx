
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CheckSquare,
  Target,
  CalendarDays,
  ChartNoAxesCombined,
  Lightbulb,
  CloudSun,
  Settings,
  LogOut,
  X,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Tasks", path: "/tasks", icon: CheckSquare },
  { name: "Goals", path: "/goals", icon: Target },
  { name: "Schedule", path: "/schedule", icon: CalendarDays },
  { name: "Analytics", path: "/analytics", icon: ChartNoAxesCombined },
  { name: "Motivation", path: "/motivation", icon: Lightbulb },
  { name: "Weather", path: "/weather", icon: CloudSun },
  { name: "Settings", path: "/settings", icon: Settings },
];

export default function Sidebar({ mobileOpen, onClose, onLogout }) {
  return (
    <>
      {mobileOpen && (
        <button
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/10 bg-[#18181B] transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0066FF]">
              <LayoutDashboard size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">
                ZidioTask
              </h1>
              <p className="text-xs text-zinc-500">Productivity workspace</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-lg p-2 text-zinc-400 hover:bg-white/5 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
          <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Workspace
          </p>

          {navigation.map(({ name, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-[#0066FF]/15 text-[#4D91FF] ring-1 ring-inset ring-[#0066FF]/25"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <Icon size={19} />
              <span>{name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-zinc-400 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={19} />
            Logout
          </button>
          <p className="mt-3 px-3 text-xs text-zinc-600">
            ZidioTask · Your daily workspace
          </p>
        </div>
      </aside>
    </>
  );
}
