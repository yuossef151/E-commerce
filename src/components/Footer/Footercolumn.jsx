import { useId } from "react";
import { Link } from "react-router-dom";

// links: [{ label: "About us", to: "/about" }]
export default function FooterColumn({ title, links }) {
  const headingId = useId();

  return (
    <nav aria-labelledby={headingId}>
      <h3
        id={headingId}
        className="mb-5 text-xs font-bold uppercase tracking-[3px] text-white"
      >
        {title}
      </h3>

      <ul className="space-y-3">
        {links.map(({ label, to }) => (
          <li key={label}>
            <Link
              to={to}
              className="inline-block rounded text-sm text-gray-400 transition hover:translate-x-1 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}