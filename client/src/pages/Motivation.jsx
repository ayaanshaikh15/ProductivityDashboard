
import { useState } from "react";
import {
  Lightbulb,
  RefreshCw,
  Quote,
  Target,
  Zap,
  Heart,
} from "lucide-react";
import Layout from "../components/layout/Layout";
import { useAuth } from "../context/AuthContext_temp";

const quotes = [
  {
    quote: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
    category: "Taking action",
  },
  {
    quote: "Great things are done by a series of small things brought together.",
    author: "Vincent van Gogh",
    category: "Consistency",
  },
  {
    quote: "It always seems impossible until it's done.",
    author: "Nelson Mandela",
    category: "Perseverance",
  },
  {
    quote: "Success is the sum of small efforts, repeated day in and day out.",
    author: "Robert Collier",
    category: "Daily progress",
  },
  {
    quote: "The future depends on what you do today.",
    author: "Mahatma Gandhi",
    category: "Focus",
  },
  {
    quote: "You don't have to see the whole staircase, just take the first step.",
    author: "Martin Luther King Jr.",
    category: "Getting started",
  },
  {
    quote: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt",
    category: "Self-belief",
  },
  {
    quote: "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius",
    category: "Persistence",
  },
  {
    quote: "Action is the foundational key to all success.",
    author: "Pablo Picasso",
    category: "Action",
  },
  {
    quote: "Small disciplines repeated with consistency every day lead to great achievements.",
    author: "John C. Maxwell",
    category: "Discipline",
  },
];

const tips = [
  {
    icon: Target,
    title: "Choose one priority",
    description:
      "Identify the one task that would make today feel productive. Give it your attention first.",
  },
  {
    icon: Zap,
    title: "Start with five minutes",
    description:
      "If a task feels overwhelming, work on it for just five minutes. Starting is often the hardest part.",
  },
  {
    icon: Heart,
    title: "Celebrate your progress",
    description:
      "Recognize the small wins. Progress matters even when you haven't reached the final goal yet.",
  },
];

export default function Motivation() {
  const { logout } = useAuth();
  const [quoteIndex, setQuoteIndex] = useState(() =>
    Math.floor(Math.random() * quotes.length)
  );
  const [savedQuotes, setSavedQuotes] = useState([]);

  const currentQuote = quotes[quoteIndex];

  const getAnotherQuote = () => {
    if (quotes.length < 2) return;

    let nextIndex = quoteIndex;
    while (nextIndex === quoteIndex) {
      nextIndex = Math.floor(Math.random() * quotes.length);
    }

    setQuoteIndex(nextIndex);
  };

  const isSaved = savedQuotes.includes(quoteIndex);

  const toggleSaved = () => {
    setSavedQuotes((previous) =>
      previous.includes(quoteIndex)
        ? previous.filter((index) => index !== quoteIndex)
        : [...previous, quoteIndex]
    );
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      window.location.assign("/login");
    }
  };

  return (
    <Layout
      title="Motivation"
      subtitle="A little inspiration to help you keep moving forward."
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-600/20 via-[#18181B] to-violet-600/10 p-6 sm:p-10">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-300">
              <Lightbulb size={14} />
              YOUR DAILY INSPIRATION
            </div>

            <p className="mt-7 text-sm font-medium text-zinc-400">
              {currentQuote.category}
            </p>

            <div className="mt-3 flex gap-3 sm:gap-5">
              <Quote
                size={30}
                className="mt-1 shrink-0 text-blue-400"
              />
              <blockquote className="text-2xl font-semibold leading-relaxed tracking-tight text-white sm:text-3xl">
                {currentQuote.quote}
              </blockquote>
            </div>

            <p className="mt-5 pl-11 text-sm text-zinc-400">
              — {currentQuote.author}
            </p>

            <div className="mt-8 flex flex-wrap gap-3 pl-0 sm:pl-11">
              <button
                onClick={getAnotherQuote}
                className="flex items-center gap-2 rounded-xl bg-[#0066FF] px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-600"
              >
                <RefreshCw size={16} />
                Inspire me
              </button>

              <button
                onClick={toggleSaved}
                className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                  isSaved
                    ? "border-pink-500/30 bg-pink-500/10 text-pink-300"
                    : "border-white/10 text-zinc-300 hover:bg-white/5"
                }`}
              >
                <Heart
                  size={16}
                  fill={isSaved ? "currentColor" : "none"}
                />
                {isSaved ? "Saved" : "Save quote"}
              </button>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-white">
              Small habits, big results
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Simple reminders to help you make the most of today.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {tips.map((tip, index) => {
              const Icon = tip.icon;

              return (
                <article
                  key={tip.title}
                  className="rounded-2xl border border-white/10 bg-[#18181B] p-5 transition hover:border-white/20"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                    <Icon size={21} />
                  </div>

                  <p className="mt-5 text-xs font-medium uppercase tracking-wider text-zinc-500">
                    TIP 0{index + 1}
                  </p>

                  <h3 className="mt-2 font-semibold text-white">
                    {tip.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    {tip.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#18181B] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-500/10 p-3 text-violet-300">
              <Heart size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-white">Your saved inspiration</h2>
              <p className="mt-1 text-sm text-zinc-400">
                {savedQuotes.length}{" "}
                {savedQuotes.length === 1 ? "quote" : "quotes"} saved in this session
              </p>
            </div>
          </div>

          {savedQuotes.length === 0 ? (
            <p className="mt-5 rounded-xl border border-dashed border-white/10 p-5 text-sm text-zinc-500">
              Found a quote you love? Save it and it will appear here while this
              page remains open.
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              {savedQuotes.map((index) => (
                <div
                  key={index}
                  className="flex items-start justify-between gap-4 rounded-xl border border-white/5 bg-[#121214] p-4"
                >
                  <div>
                    <p className="text-sm leading-6 text-zinc-200">
                      “{quotes[index].quote}”
                    </p>
                    <p className="mt-2 text-xs text-zinc-500">
                      — {quotes[index].author}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setSavedQuotes((previous) =>
                        previous.filter((item) => item !== index)
                      )
                    }
                    aria-label="Remove saved quote"
                    className="shrink-0 rounded-lg p-2 text-zinc-500 hover:bg-white/5 hover:text-red-300"
                  >
                    <Heart size={17} fill="currentColor" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
