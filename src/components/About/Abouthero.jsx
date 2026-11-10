import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle } from "lucide-react";
import { getProducts } from "../../API/API";

// Products whose photos appear in the hero (matched by name, like the slider)
const HERO_PRODUCTS = [
  "Razer BlackWidow V4 Pro",
  "Meta Quest 3",
  "Sony PlayStation 5 (PS5)",
];

// Position / tilt of each photo tile
const TILE_POSITIONS = [
  "left-[2%] top-[4%] w-[46%] -rotate-6",
  "right-[2%] top-[22%] w-[46%] rotate-6",
  "left-[18%] bottom-[2%] w-[46%] -rotate-2",
];

export default function AboutHero() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let alive = true;

    getProducts()
      .then((all) => {
        if (!alive) return;
        const found = HERO_PRODUCTS.map((name) =>
          all.find((p) => p.name === name)
        ).filter((p) => p?.image_url);
        setItems(found);
      })
      .catch((err) => console.error("AboutHero: could not load products", err));

    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="w-full py-8">
      <div className="lg:px-10 px-4">
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-[#14152a] via-[#111827] to-[#08090d] text-white shadow-[0_25px_80px_rgba(0,0,0,0.35)]">
          {/* glow */}
          <div className="absolute -right-24 top-1/2 -translate-y-1/2 h-[420px] w-[420px] rounded-full bg-[#c0405c]/25 blur-[110px] pointer-events-none" />

          <div
            className={`relative z-10 grid items-center gap-10 px-7 py-12 md:px-16 md:py-16 ${
              items.length ? "md:grid-cols-2" : ""
            }`}
          >
            {/* TEXT */}
            <div className="flex flex-col items-start gap-5">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#ff6b8a] animate-pulse" />
                <span className="text-xs font-bold tracking-[3px] uppercase text-[#ff6b8a]">
                  About us
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl lg:text-[56px] font-extrabold leading-[1.12] tracking-tight">
                We bring the best tech{" "}
                <span className="text-[#ff6b8a]">to your door</span>
              </h1>

              <p className="text-gray-400 text-sm md:text-base leading-7 max-w-lg">
                From gaming gear and consoles to laptops, phones and VR, we
                pick original devices from trusted brands and deliver them with
                care, honest prices and real support.
              </p>

              <div className="flex flex-wrap gap-3 mt-2">
                <Link
                  to="/Shop"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#8f1a36] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#a82244] focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  Shop now
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* PRODUCT COLLAGE */}
            {items.length > 0 && (
              <div className="relative h-[280px] md:h-[380px]" aria-hidden="true">
                {items.map((product, i) => (
                  <div
                    key={product.id}
                    className={`absolute aspect-square rounded-3xl border border-white/10 bg-white/[0.06] p-4 shadow-xl backdrop-blur-sm ${TILE_POSITIONS[i]}`}
                  >
                    <img
                      src={product.image_url}
                      alt=""
                      className="h-full w-full object-contain drop-shadow-[0_15px_20px_rgba(0,0,0,0.5)]"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}