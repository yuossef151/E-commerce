import { useEffect, useRef, useState } from "react";
import { getProducts } from "../../API/API";

// Counts up from 0 when the number scrolls into view
function CountUp({ to, decimals = 0, suffix = "" }) {
  const ref = useRef(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || !to) return;

    let raf;
    let started = false;

    const run = () => {
      const t0 = performance.now();
      const tick = (now) => {
        const p = Math.min((now - t0) / 1400, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setValue(to * eased);
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          started = true;
          run();
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to]);

  return (
    <span ref={ref}>
      {value.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

export default function AboutStats() {
  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    let alive = true;
    getProducts()
      .then((all) => alive && setProductCount(all.length))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // Only "Products" is real (from the database). Edit the others to your own numbers.
  const stats = [
    { label: "Products in store", to: productCount, suffix: "+" },
    { label: "Happy customers", to: 12000, suffix: "+" },
    { label: "Cities we deliver to", to: 27, suffix: "" },
    { label: "Average rating", to: 4.9, decimals: 1, suffix: "/5" },
  ];

  return (
    <section className="w-full py-8">
      <div className="lg:px-10 px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-3xl border border-gray-200 bg-white p-6 text-center shadow-sm"
            >
              <p className="text-3xl md:text-4xl font-extrabold text-[#8f1a36]">
                <CountUp to={s.to} decimals={s.decimals} suffix={s.suffix} />
              </p>
              <p className="mt-2 text-sm font-medium text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}