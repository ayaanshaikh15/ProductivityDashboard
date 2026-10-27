
import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout({
  children,
  title = "Dashboard",
  subtitle = "Manage your work and stay productive.",
  onLogout,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeSidebar = () => setMobileOpen(false);

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={closeSidebar}
        onLogout={onLogout}
      />

      <div className="min-h-screen lg:pl-64">
        <Header
          title={title}
          subtitle={subtitle}
          onMenuClick={() => setMobileOpen(true)}
        />

        <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
