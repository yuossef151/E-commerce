import { Link, NavLink } from "react-router-dom";
import { Keyboard, Gamepad2, Laptop, Smartphone, Glasses, ArrowUpRight } from "lucide-react";

// Same colour language as the home slider, so the site feels consistent
const CATEGORIES = [
  {
    icon: Keyboard,
    title: "Gaming gear",
    text: "Keyboards, mice and headsets built for speed.",
    accent: "#e11d48",
    bg: "from-[#19151e] to-[#08090d]",
  },
  {
    icon: Gamepad2,
    title: "Consoles",
    text: "Next-gen consoles and the games that go with them.",
    accent: "#22d3ee",
    bg: "from-[#0c1c2e] to-[#070b12]",
  },
  {
    icon: Laptop,
    title: "Laptops",
    text: "Powerful machines for work, creating and play.",
    accent: "#34d399",
    bg: "from-[#0e231e] to-[#070d0e]",
  },
  {
    icon: Smartphone,
    title: "Smartphones",
    text: "Flagship phones with great cameras and battery life.",
    accent: "#a855f7",
    bg: "from-[#20152e] to-[#09090e]",
  },
  {
    icon: Glasses,
    title: "VR and wearables",
    text: "Step into mixed reality with the latest headsets.",
    accent: "#818cf8",
    bg: "from-[#14152a] to-[#080b16]",
  },
];

export default function AboutCategories() {
  return (
    <section className="w-full py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-bold tracking-[3px] uppercase text-gray-900">
            What we sell
          </p>
          <h2 className="mt-2 text-3xl md:text-4xl font-extrabold tracking-tight text-[#8f1a36]">
            Find the tech you love
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {CATEGORIES.map(({ icon: Icon, title, text, accent, bg }) => (
            <NavLink
              key={title}
              to="/Shop"
              className={`group relative flex min-h-[220px] flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${bg} p-5 text-white transition duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8f1a36]`}
            >
              <div
                className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-30 blur-3xl transition group-hover:opacity-60"
                style={{ backgroundColor: accent }}
              />

              <span
                className="relative flex h-11 w-11 items-center justify-center rounded-2xl"
                style={{ backgroundColor: `${accent}22`, color: accent }}
              >
                <Icon size={22} />
              </span>

              <div className="relative">
                <h3 className="flex items-center justify-between text-lg font-bold">
                  {title}
                  <ArrowUpRight
                    size={18}
                    className="opacity-0 transition group-hover:opacity-100"
                    style={{ color: accent }}
                  />
                </h3>
                <p className="mt-1 text-sm leading-6 text-gray-400">{text}</p>
              </div>
            </NavLink>
          ))}
        </div>
      </div>
    </section>
  );
}