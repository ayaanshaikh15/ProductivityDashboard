
import { useEffect, useState } from "react";
import {
  UserRound,
  Palette,
  Bell,
  ShieldCheck,
  Save,
  RotateCcw,
} from "lucide-react";
import toast from "react-hot-toast";
import Layout from "../components/layout/Layout";
import { useAuth } from "../context/AuthContext_temp";

const DEFAULT_SETTINGS = {
  compactMode: false,
  showGreeting: true,
  taskReminders: true,
  goalReminders: true,
  scheduleReminders: true,
  emailNotifications: false,
};

function Toggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div>
        <p className="text-sm font-medium text-zinc-100">{label}</p>
        <p className="mt-1 text-sm text-zinc-500">{description}</p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-blue-600" : "bg-zinc-700"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function SectionCard({ icon: Icon, title, description, children }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-zinc-900 p-5 sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-400">
          <Icon size={19} />
        </div>
        <div>
          <h2 className="font-semibold text-white">{title}</h2>
          <p className="mt-1 text-sm text-zinc-500">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export default function Settings() {
  const { user, logout } = useAuth();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("zidiotask-settings");

      if (saved) {
        setSettings({
          ...DEFAULT_SETTINGS,
          ...JSON.parse(saved),
        });
      }
    } catch {
      toast.error("Could not load saved preferences.");
    } finally {
      setLoaded(true);
    }
  }, []);

  const updateSetting = (key, value) => {
    setSettings((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const saveSettings = () => {
    try {
      localStorage.setItem(
        "zidiotask-settings",
        JSON.stringify(settings)
      );
      toast.success("Preferences saved successfully.");
    } catch {
      toast.error("Unable to save preferences in this browser.");
    }
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.removeItem("zidiotask-settings");
      toast.success("Preferences reset to defaults.");
    } catch {
      toast.error("Unable to reset preferences.");
    }
  };

  const displayName =
    user?.name || user?.username || "ZidioTask User";

  const email = user?.email || "No email available";

  if (!loaded) {
    return (
      <Layout
        title="Settings"
        subtitle="Personalize your workspace."
        onLogout={logout}
      >
        <div className="animate-pulse rounded-2xl border border-white/10 bg-zinc-900 p-8 text-zinc-500">
          Loading preferences...
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Settings"
      subtitle="Personalize your ZidioTask workspace."
      onLogout={async () => {
        try {
          await logout();
        } finally {
          window.location.assign("/login");
        }
      }}
    >
      <div className="mx-auto max-w-5xl space-y-6 pb-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-semibold text-white">
              General settings
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Manage your profile and personal preferences.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={resetSettings}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-zinc-300 transition hover:bg-white/5"
            >
              <RotateCcw size={16} />
              Reset
            </button>

            <button
              onClick={saveSettings}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
            >
              <Save size={16} />
              Save changes
            </button>
          </div>
        </div>

        <SectionCard
          icon={UserRound}
          title="Profile"
          description="Your current account information."
        >
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600/15 text-lg font-semibold text-blue-400">
              {displayName.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
              <p className="truncate font-medium text-white">
                {displayName}
              </p>
              <p className="mt-1 truncate text-sm text-zinc-500">
                {email}
              </p>
              <p className="mt-2 text-xs text-zinc-600">
                Profile details are read-only in this version.
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          icon={Palette}
          title="Appearance"
          description="Customize how your workspace is displayed."
        >
          <Toggle
            label="Compact mode"
            description="Use a more compact layout for workspace content."
            checked={settings.compactMode}
            onChange={(value) => updateSetting("compactMode", value)}
          />

          <div className="border-t border-white/5">
            <Toggle
              label="Show dashboard greeting"
              description="Keep the welcome message visible on your dashboard."
              checked={settings.showGreeting}
              onChange={(value) => updateSetting("showGreeting", value)}
            />
          </div>

          <div className="mt-2 flex items-center justify-between gap-4 border-t border-white/5 pt-4">
            <div>
              <p className="text-sm font-medium text-zinc-100">
                Color theme
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Current dashboard theme
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-300">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              Dark · Blue
            </span>
          </div>
        </SectionCard>

        <SectionCard
          icon={Bell}
          title="Notifications"
          description="Choose which reminders you want enabled."
        >
          <Toggle
            label="Task reminders"
            description="Reminders for tasks you need to complete."
            checked={settings.taskReminders}
            onChange={(value) => updateSetting("taskReminders", value)}
          />

          <div className="border-t border-white/5">
            <Toggle
              label="Goal reminders"
              description="Keep your goals and progress in focus."
              checked={settings.goalReminders}
              onChange={(value) => updateSetting("goalReminders", value)}
            />
          </div>

          <div className="border-t border-white/5">
            <Toggle
              label="Schedule reminders"
              description="Stay aware of upcoming scheduled activities."
              checked={settings.scheduleReminders}
              onChange={(value) =>
                updateSetting("scheduleReminders", value)
              }
            />
          </div>

          <div className="border-t border-white/5">
            <Toggle
              label="Email notifications"
              description="Preference only; email delivery is not configured."
              checked={settings.emailNotifications}
              onChange={(value) =>
                updateSetting("emailNotifications", value)
              }
            />
          </div>
        </SectionCard>

        <SectionCard
          icon={ShieldCheck}
          title="Privacy and storage"
          description="Understand how these preferences work."
        >
          <p className="text-sm leading-6 text-zinc-400">
            Settings are saved locally in this browser. They are not
            synced to your account or other devices. Clearing this
            browser's site data will remove your saved preferences.
            Notification switches record your preferences only; they
            do not schedule reminders or send emails yet.
          </p>
        </SectionCard>
      </div>
    </Layout>
  );
}
