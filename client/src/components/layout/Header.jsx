
import { Menu, Search, Bell, UserRound } from "lucide-react";
import { Link } from "react-router-dom";

export default function Header({
  title,
  subtitle,
  onMenuClick,
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#121212]/90 backdrop-blur-xl">
      <div className="flex min-h-20 items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onMenuClick}
            aria-label="Open navigation"
            className="rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-white lg:hidden"
          >
            <Menu size={22} />
          </button>

          <div className="min-w-0">
            <h2 className="truncate text-xl font-semibold text-white sm:text-2xl">
              {title}
            </h2>
            <p className="mt-1 hidden truncate text-sm text-zinc-400 sm:block">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-[#18181B] px-3 py-2 md:flex">
            <Search size={17} className="text-zinc-500" />
            <input
              type="search"
              placeholder="Search..."
              aria-label="Search"
              className="w-32 bg-transparent text-sm text-white outline-none placeholder:text-zinc-500 lg:w-44"
            />
            <kbd className="hidden rounded border border-white/10 px-1.5 py-0.5 text-xs text-zinc-500 lg:block">
              /
            </kbd>
          </div>

         

          <Link to={'/settings'} className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#202024] text-zinc-300">
            <UserRound size={20} />
          </Link>
        </div>
      </div>
    </header>
  );
}
