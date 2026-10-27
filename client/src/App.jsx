
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider, useAuth } from "./context/AuthContext_temp";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/layout/Layout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
const pageInfo = {
  tasks: ["Tasks", "Organize and manage your tasks."],
  goals: ["Goals", "Track your progress toward your goals."],
  schedule: ["Schedule", "Plan your day and upcoming events."],
  analytics: ["Analytics", "Review your productivity."],
  motivation: ["Motivation", "Find inspiration for your next task."],
  weather: ["Weather", "Check the weather for your day."],
  settings: ["Settings", "Manage your account preferences."],
};

function PlaceholderPage({ page }) {
  const { user, logout } = useAuth();
  const [title, subtitle] = pageInfo[page];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      window.location.assign("/login");
    }
  };

  return (
    <Layout
      title={title}
      subtitle={subtitle}
      onLogout={handleLogout}
    >
      <div className="rounded-2xl border border-white/10 bg-[#18181B] p-6 sm:p-8">
        <h3 className="text-xl font-semibold text-white">
          Welcome{user?.name ? `, ${user.name}` : ""}!
        </h3>

        <p className="mt-2 text-sm text-zinc-400">
          Your {title.toLowerCase()} page will be built in its own step.
        </p>
      </div>
    </Layout>
  );
}

function AppRoutes() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#18181B",
            color: "#FFFFFF",
            border: "1px solid #303036",
          },
        }}
      />

      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
     
        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
           <Route path="/tasks" element={<Tasks />} />
          {Object.keys(pageInfo).map((page) => (
            <Route
              key={page}
              path={`/${page}`}
              element={<PlaceholderPage page={page} />}
            />
          ))}
        </Route>

        {/* Default and unknown routes */}
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />
     
        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
