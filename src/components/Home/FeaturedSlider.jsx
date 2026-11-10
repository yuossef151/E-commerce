import { useState, useEffect, useRef } from "react";
import { getProducts } from "../../API/API";

const HOLD_MS = 3000;
const ENTER_MS = 1400;
const TRANSITION_MS = 900;

const selectedProductNames = [
  "Razer BlackWidow V4 Pro",
  "Meta Quest 3",
  "Lenovo Legion Pro 7i",
  "Samsung Galaxy S24 Ultra",
  "Apple iPhone 15 Pro Max",
  "Sony PlayStation 5 (PS5)",
  "Dell XPS 15",
];

const productThemes = {
  "Razer BlackWidow V4 Pro": {
    bg: "from-[#19151e] via-[#11131b] to-[#08090d]",
    glow: "bg-pink-600/20",
    accent: "#e11d48",
    label: "GAMING GEAR",
  },
  "Meta Quest 3": {
    bg: "from-[#14152a] via-[#111827] to-[#080b16]",
    glow: "bg-indigo-500/25",
    accent: "#818cf8",
    label: "VIRTUAL REALITY",
  },
  "Lenovo Legion Pro 7i": {
    bg: "from-[#241313] via-[#171116] to-[#09090b]",
    glow: "bg-red-600/20",
    accent: "#ef4444",
    label: "ULTIMATE PERFORMANCE",
  },
  "Samsung Galaxy S24 Ultra": {
    bg: "from-[#20152e] via-[#151522] to-[#09090e]",
    glow: "bg-purple-500/25",
    accent: "#a855f7",
    label: "SMART TECHNOLOGY",
  },
  "Apple iPhone 15 Pro Max": {
    bg: "from-[#102034] via-[#111827] to-[#08090d]",
    glow: "bg-blue-500/25",
    accent: "#60a5fa",
    label: "PREMIUM DEVICES",
  },
  "Sony PlayStation 5 (PS5)": {
    bg: "from-[#0c1c2e] via-[#0f1a2b] to-[#070b12]",
    glow: "bg-cyan-500/25",
    accent: "#22d3ee",
    label: "NEXT-GEN CONSOLE",
  },
  "Dell XPS 15": {
    bg: "from-[#0e231e] via-[#10191c] to-[#070d0e]",
    glow: "bg-emerald-500/25",
    accent: "#34d399",
    label: "CREATOR LAPTOP",
  },
};

const defaultTheme = {
  bg: "from-gray-900 to-black",
  glow: "bg-purple-500/20",
  accent: "#a855f7",
  label: "FEATURED PRODUCT",
};

const themeOf = (product) => productThemes[product?.name] || defaultTheme;
const pad = (n) => String(n + 1).padStart(2, "0");

const showcaseStyles = `
  .fs-item {
    animation: fsUp 0.8s cubic-bezier(0.22, 0.9, 0.3, 1) both;
    animation-delay: calc(var(--d, 0) * 70ms + 300ms);
  }

  .fs-img-out { animation: fsImgOut 0.3s cubic-bezier(0.4, 0, 0.8, 0.4) both; }
  .fs-img-in  { animation: fsImgIn 0.9s cubic-bezier(0.2, 0.9, 0.25, 1.1) 300ms both; }
  .fs-float   { animation: fsFloat 6s ease-in-out infinite; }

  .fs-num-in  { animation: fsNumIn 0.7s cubic-bezier(0.22, 0.9, 0.3, 1) both; }
  .fs-num-out { animation: fsNumOut 0.7s cubic-bezier(0.22, 0.9, 0.3, 1) both; }

  @keyframes fsUp {
    from { opacity: 0; transform: translateY(26px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fsImgIn {
    from { opacity: 0; transform: translateX(90px) scale(0.82) rotate(-6deg); }
    to   { opacity: 1; transform: none; }
  }
  @keyframes fsImgOut {
    from { opacity: 1; transform: none; }
    to   { opacity: 0; transform: translateX(-90px) scale(0.82) rotate(6deg); }
  }
  @keyframes fsNumIn {
    from { transform: translateY(100%); }
    to   { transform: translateY(0); }
  }
  @keyframes fsNumOut {
    from { transform: translateY(0); }
    to   { transform: translateY(-100%); }
  }
  @keyframes fsFloat {
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-10px); }
  }

  @media (prefers-reduced-motion: reduce) {
    .fs-item, .fs-img-in, .fs-float, .fs-num-in { animation: none !important; }
    .fs-img-out, .fs-num-out { display: none; }
  }
`;

export default function FeaturedSlider({ onLoaded }) {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState(null);
  const prevTimer = useRef(null);

  const count = featuredProducts.length;

  useEffect(() => {
    async function loadFeatured() {
      try {
        setLoading(true);

        const allProducts = await getProducts();

        const sorted = selectedProductNames
          .map((name) => allProducts.find((product) => product.name === name))
          .filter(Boolean);

        sorted.forEach((p) => {
          if (p.image_url) new Image().src = p.image_url;
        });

        setFeaturedProducts(sorted);
      } catch (err) {
        console.error("Error loading featured products:", err);
      } finally {
        setLoading(false);
        onLoaded?.();
      }
    }

    loadFeatured();
  }, []);

  const goTo = (index) => {
    if (index === current) return;
    setPrev(current);
    setCurrent(index);
    clearTimeout(prevTimer.current);
    prevTimer.current = setTimeout(() => setPrev(null), TRANSITION_MS);
  };

  useEffect(() => {
    if (count < 2) return;
    const id = setTimeout(
      () => goTo((current + 1) % count),
      HOLD_MS + ENTER_MS
    );
    return () => clearTimeout(id);
  }, [current, count]);

  useEffect(() => () => clearTimeout(prevTimer.current), []);

  if (loading) {
    return (
      <div className="py-24 text-center text-gray-400">Loading showcase...</div>
    );
  }

  if (!count) return null;

  const product = featuredProducts[current];
  const theme = themeOf(product);
  const prevProduct = prev !== null ? featuredProducts[prev] : null;

  return (
    <section className="w-full py-4 sm:py-8">
      <style>{showcaseStyles}</style>

      <div className=" lg:px-10 px-4">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-[28px] border border-white/10 bg-[#090a10] text-white shadow-[0_25px_80px_rgba(0,0,0,0.35)]">
          {featuredProducts.map((p, i) => (
            <div
              key={`bg-${p.id}`}
              aria-hidden="true"
              className={`absolute inset-0 bg-gradient-to-br ${themeOf(p).bg} transition-opacity duration-[900ms] ease-in-out ${
                i === current ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}

          {featuredProducts.map((p, i) => (
            <div
              key={`glow-${p.id}`}
              aria-hidden="true"
              className={`absolute w-[250px] h-[250px] md:w-[550px] md:h-[550px] rounded-full blur-[110px] ${themeOf(p).glow} right-[5%] top-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-[900ms] ease-in-out ${
                i === current ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.035),transparent_65%)] pointer-events-none" />

          <div
            aria-hidden="true"
            className="absolute right-4 top-4 sm:right-10 sm:top-10 flex text-6xl sm:text-8xl md:text-[180px] font-black leading-none select-none pointer-events-none"
          >
            {[0, 1].map((pos) => {
              const digits = pad(current);
              const oldDigits = prevProduct ? pad(prev) : null;
              const ch = digits[pos];
              const oldCh = oldDigits ? oldDigits[pos] : null;
              const changed = oldDigits !== null && oldCh !== ch;

              return (
                <span key={pos} className="relative block overflow-hidden">
                  <span
                    key={`d-${pos}-${ch}`}
                    className={`block transition-colors duration-[900ms] ${
                      changed ? "fs-num-in" : ""
                    }`}
                    style={{ color: `${theme.accent}22` }}
                  >
                    {ch}
                  </span>
                  {changed && (
                    <span
                      key={`o-${pos}-${oldCh}`}
                      className="fs-num-out absolute inset-0 block"
                      style={{ color: `${themeOf(prevProduct).accent}22` }}
                    >
                      {oldCh}
                    </span>
                  )}
                </span>
              );
            })}
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between min-h-[440px] md:min-h-[520px] px-5 pt-10 pb-14 md:px-16 md:pt-16 md:pb-20 gap-6 md:gap-8">
            <div
              key={`info-${current}`}
              className="w-full md:w-[48%] flex flex-col items-start gap-3 sm:gap-5"
            >
              <div
                className="fs-item flex items-center gap-2 sm:gap-3"
                style={{ "--d": 0 }}
              >
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: theme.accent }}
                />
                <span
                  className="text-[10px] sm:text-xs font-bold tracking-[2px] sm:tracking-[3px] uppercase"
                  style={{ color: theme.accent }}
                >
                  {theme.label}
                </span>
              </div>

              <div
                className="fs-item h-[3px] w-12 sm:w-14 rounded-full bg-white/20"
                style={{ "--d": 1 }}
              />

              <h2
                className="fs-item text-2xl sm:text-3xl md:text-5xl lg:text-[56px] font-extrabold leading-[1.15] sm:leading-[1.12] tracking-tight"
                style={{ "--d": 2 }}
              >
                {product.name}
              </h2>

              <p
                className="fs-item text-gray-400 text-xs sm:text-sm md:text-base leading-6 sm:leading-7 max-w-lg line-clamp-3"
                style={{ "--d": 3 }}
              >
                {product.description}
              </p>

              <div
                className="fs-item flex items-center gap-2 sm:gap-3 mt-1 sm:mt-3"
                style={{ "--d": 4 }}
              >
                <span
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-white/10 flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: `${theme.accent}20`,
                    color: theme.accent,
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-4 h-4 sm:w-5 sm:h-5"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>

                <span className="text-[11px] sm:text-xs text-gray-400 tracking-wider uppercase font-semibold">
                  Discover the experience
                </span>
              </div>
            </div>

            <div className="relative w-full md:w-[52%] h-[220px] sm:h-[260px] md:h-[390px] flex items-center justify-center">
              <div className="absolute w-[180px] h-[180px] sm:w-[230px] sm:h-[230px] md:w-[370px] md:h-[370px] rounded-full border border-white/[0.06]" />

              <div className="absolute w-[140px] h-[140px] sm:w-[190px] sm:h-[190px] md:w-[310px] md:h-[310px] rounded-full border border-white/[0.05]" />

              {featuredProducts.map((p, i) => (
                <div
                  key={`img-glow-${p.id}`}
                  aria-hidden="true"
                  className={`absolute w-[140px] h-[140px] sm:w-[180px] sm:h-[180px] md:w-[280px] md:h-[280px] rounded-full blur-[70px] ${themeOf(p).glow} transition-opacity duration-[900ms] ease-in-out ${
                    i === current ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}

              {prevProduct?.image_url && (
                <div
                  key={`img-out-${prev}`}
                  aria-hidden="true"
                  className="fs-img-out absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
                >
                  <img
                    src={prevProduct.image_url}
                    alt=""
                    className="max-w-full max-h-[200px] sm:max-h-[250px] md:max-h-[370px] object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.65)]"
                  />
                </div>
              )}

              {product.image_url && (
                <div
                  key={`img-in-${current}`}
                  className="fs-img-in absolute inset-0 z-20 flex items-center justify-center"
                >
                  <div className="fs-float flex items-center justify-center">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="max-w-full max-h-[200px] sm:max-h-[250px] md:max-h-[370px] object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.65)] transition-transform duration-700 hover:scale-110"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {count > 1 && (
            <div className="absolute bottom-4 sm:bottom-6 left-5 sm:left-7 md:left-16 z-30 flex items-center gap-2">
              {featuredProducts.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Show ${p.name}`}
                  aria-current={i === current}
                  className="h-1 rounded-full cursor-pointer transition-all duration-500"
                  style={{
                    width: i === current ? 32 : 10,
                    backgroundColor:
                      i === current ? theme.accent : "rgba(255,255,255,0.25)",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}