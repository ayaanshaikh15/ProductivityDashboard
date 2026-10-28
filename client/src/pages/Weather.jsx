
import { useCallback, useEffect, useState } from "react";
import {
  Sun,
  Cloud,
  CloudRain,
  CloudSun,
  CloudLightning,
  CloudSnow,
  CloudFog,
  Wind,
  Droplets,
  Thermometer,
  MapPin,
  Search,
  RefreshCw,
  Sunrise,
  Sunset,
  LoaderCircle,
  Umbrella,
} from "lucide-react";
import toast from "react-hot-toast";
import Layout from "../components/layout/Layout";
import { useAuth } from "../context/AuthContext_temp";

const DEFAULT_CITY = "Belagavi";

function getWeather(code) {
  if (code === 0) return { label: "Clear sky", Icon: Sun };
  if ([1, 2].includes(code)) return { label: "Partly cloudy", Icon: CloudSun };
  if (code === 3) return { label: "Overcast", Icon: Cloud };
  if ([45, 48].includes(code)) return { label: "Foggy", Icon: CloudFog };
  if ([51, 53, 55, 56, 57].includes(code))
    return { label: "Drizzle", Icon: CloudRain };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code))
    return { label: "Rainy", Icon: CloudRain };
  if ([71, 73, 75, 77, 85, 86].includes(code))
    return { label: "Snowy", Icon: CloudSnow };
  if ([95, 96, 99].includes(code))
    return { label: "Thunderstorm", Icon: CloudLightning };
  return { label: "Weather conditions", Icon: CloudSun };
}

function formatClock(value) {
  if (!value) return "--";
  return new Date(value).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDay(value) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("en-IN", {
    weekday: "short",
  });
}

function formatDate(value) {
  return new Date(value).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

const cardClass =
  "rounded-2xl border border-white/10 bg-[#18181B] p-5 sm:p-6";

export default function Weather() {
  const { logout } = useAuth();
  const [cityInput, setCityInput] = useState(DEFAULT_CITY);
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  const loadWeather = useCallback(async (city) => {
    setSearching(true);
    setError("");

    try {
      const geoUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
      geoUrl.search = new URLSearchParams({
        name: city,
        count: "1",
        language: "en",
        format: "json",
      }).toString();

      const geoResponse = await fetch(geoUrl);

      if (!geoResponse.ok) throw new Error("Could not search for this city.");

      const geoData = await geoResponse.json();
      const place = geoData.results?.[0];

      if (!place) {
        throw new Error("City not found. Try another city name.");
      }

      const forecastUrl = new URL("https://api.open-meteo.com/v1/forecast");
      forecastUrl.search = new URLSearchParams({
        latitude: String(place.latitude),
        longitude: String(place.longitude),
        current:
          "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m",
        hourly: "temperature_2m,precipitation_probability,weather_code",
        daily:
          "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset",
        timezone: "auto",
        forecast_days: "7",
      }).toString();

      const forecastResponse = await fetch(forecastUrl);

      if (!forecastResponse.ok) {
        throw new Error("Could not retrieve the weather forecast.");
      }

      const forecastData = await forecastResponse.json();

      setLocation({
        name: place.name,
        region: place.admin1,
        country: place.country,
        timezone: forecastData.timezone,
      });
      setWeather(forecastData);
      setCityInput(place.name);
    } catch (err) {
      setError(err.message || "Something went wrong loading the weather.");
      toast.error(err.message || "Unable to load weather.");
    } finally {
      setSearching(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWeather(DEFAULT_CITY);
  }, [loadWeather]);

  const handleSearch = (event) => {
    event.preventDefault();
    const city = cityInput.trim();

    if (!city) {
      toast.error("Enter a city name.");
      return;
    }

    loadWeather(city);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      window.location.assign("/login");
    }
  };

  const current = weather?.current;
  const daily = weather?.daily;
  const hourly = weather?.hourly;
  const currentConditions = current ? getWeather(current.weather_code) : null;
  const CurrentIcon = currentConditions?.Icon;

  const hourlyIndices = hourly
    ? hourly.time
        .map((time, index) => ({ time, index }))
        .filter(({ time }) => {
          const forecastTime = new Date(time);
          const now = new Date(current?.time || Date.now());
          return forecastTime >= now;
        })
        .slice(0, 8)
    : [];

  if (loading) {
    return (
      <Layout
        title="Weather"
        subtitle="Plan your day around the weather."
        onLogout={handleLogout}
      >
        <div className="flex min-h-72 items-center justify-center gap-3 text-zinc-400">
          <LoaderCircle size={24} className="animate-spin" />
          Loading weather forecast...
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Weather"
      subtitle="Plan your day around the weather."
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-semibold text-white">
              Weather forecast
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Current conditions and the week ahead.
            </p>
          </div>

          <button
            onClick={() => loadWeather(location?.name || DEFAULT_CITY)}
            disabled={searching}
            className="flex items-center justify-center gap-2 self-start rounded-xl border border-white/10 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={searching ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <MapPin
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              value={cityInput}
              onChange={(event) => setCityInput(event.target.value)}
              placeholder="Search city..."
              aria-label="Search city"
              className="w-full rounded-xl border border-white/10 bg-[#18181B] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={searching}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#0066FF] px-5 py-3 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {searching ? (
              <LoaderCircle size={17} className="animate-spin" />
            ) : (
              <Search size={17} />
            )}
            Search
          </button>
        </form>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <p className="text-sm text-red-300">{error}</p>
            <button
              onClick={() => loadWeather(cityInput.trim() || DEFAULT_CITY)}
              className="mt-2 text-sm text-white underline"
            >
              Try again
            </button>
          </div>
        )}

        {weather && current && daily && (
          <>
            <section className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-600/20 via-[#18181B] to-cyan-500/10 p-6 sm:p-8">
              <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

              <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <div className="flex items-center gap-2 text-sm text-zinc-300">
                    <MapPin size={16} className="text-blue-400" />
                    {location?.name}
                    {location?.region ? `, ${location.region}` : ""}
                    {location?.country ? `, ${location.country}` : ""}
                  </div>

                  <p className="mt-5 text-sm text-zinc-400">
                    {formatDate(current.time)}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-4">
                    <p className="text-6xl font-semibold tracking-tight text-white sm:text-7xl">
                      {Math.round(current.temperature_2m)}°
                    </p>
                    {CurrentIcon && (
                      <CurrentIcon
                        size={58}
                        strokeWidth={1.4}
                        className="text-blue-300"
                      />
                    )}
                  </div>

                  <p className="mt-3 text-lg text-zinc-200">
                    {currentConditions?.label}
                  </p>
                  <p className="mt-1 text-sm text-zinc-400">
                    Feels like {Math.round(current.apparent_temperature)}°
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 self-end">
                  <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <Droplets size={19} className="text-cyan-300" />
                    <p className="mt-3 text-xs text-zinc-400">Humidity</p>
                    <p className="mt-1 text-xl font-semibold text-white">
                      {current.relative_humidity_2m}%
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <Wind size={19} className="text-blue-300" />
                    <p className="mt-3 text-xs text-zinc-400">Wind speed</p>
                    <p className="mt-1 text-xl font-semibold text-white">
                      {Math.round(current.wind_speed_10m)}{" "}
                      <span className="text-xs font-normal text-zinc-400">
                        km/h
                      </span>
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <Sunrise size={19} className="text-amber-300" />
                    <p className="mt-3 text-xs text-zinc-400">Sunrise</p>
                    <p className="mt-1 text-lg font-semibold text-white">
                      {formatClock(daily.sunrise?.[0])}
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <Sunset size={19} className="text-orange-300" />
                    <p className="mt-3 text-xs text-zinc-400">Sunset</p>
                    <p className="mt-1 text-lg font-semibold text-white">
                      {formatClock(daily.sunset?.[0])}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className={cardClass}>
              <div className="mb-6">
                <h3 className="font-semibold text-white">Today's outlook</h3>
                <p className="mt-1 text-sm text-zinc-400">
                  Upcoming hourly conditions
                </p>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2">
                {hourlyIndices.map(({ time, index }) => {
                  const HourIcon = getWeather(
                    hourly.weather_code[index]
                  ).Icon;

                  return (
                    <div
                      key={time}
                      className="min-w-[92px] flex-1 rounded-xl border border-white/5 bg-[#121214] px-3 py-4 text-center"
                    >
                      <p className="text-xs text-zinc-400">
                        {new Date(time).toLocaleTimeString("en-IN", {
                          hour: "numeric",
                        })}
                      </p>
                      <HourIcon
                        size={24}
                        className="mx-auto my-4 text-blue-300"
                      />
                      <p className="font-semibold text-white">
                        {Math.round(hourly.temperature_2m[index])}°
                      </p>
                      <p className="mt-2 flex items-center justify-center gap-1 text-xs text-cyan-300">
                        <Umbrella size={12} />
                        {hourly.precipitation_probability[index] ?? 0}%
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className={cardClass}>
              <div className="mb-6">
                <h3 className="font-semibold text-white">7-day forecast</h3>
                <p className="mt-1 text-sm text-zinc-400">
                  Temperature and conditions for the week ahead.
                </p>
              </div>

              <div className="divide-y divide-white/5">
                {daily.time.map((date, index) => {
                  const { Icon, label } = getWeather(daily.weather_code[index]);

                  return (
                    <div
                      key={date}
                      className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-4 first:pt-0 last:pb-0"
                    >
                      <div>
                        <p className="font-medium text-white">
                          {index === 0 ? "Today" : formatDay(date)}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">{label}</p>
                      </div>

                      <Icon size={24} className="text-blue-300" />

                      <div className="flex items-center justify-end gap-3 text-sm">
                        <span className="text-zinc-500">
                          {Math.round(daily.temperature_2m_min[index])}°
                        </span>
                        <div className="h-1.5 w-12 overflow-hidden rounded-full bg-gradient-to-r from-cyan-500 to-orange-400 sm:w-20" />
                        <span className="font-medium text-white">
                          {Math.round(daily.temperature_2m_max[index])}°
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <p className="text-center text-xs text-zinc-500">
              Weather data provided by{" "}
              <a
                href="https://open-meteo.com/"
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:underline"
              >
                Open-Meteo
              </a>
              .
            </p>
          </>
        )}

        {!weather && !error && (
          <div className="flex min-h-48 items-center justify-center gap-2 text-zinc-400">
            <Thermometer size={20} />
            Weather data is not available.
          </div>
        )}
      </div>
    </Layout>
  );
}
