import { Link } from "react-router-dom";
import { Zap } from "lucide-react";
import { FaFacebookF, FaInstagram, FaXTwitter, FaYoutube } from "react-icons/fa6";

const SOCIALS = [
  { label: "Facebook", href: "https://facebook.com", icon: FaFacebookF },
  { label: "Instagram", href: "https://instagram.com", icon: FaInstagram },
  { label: "X (Twitter)", href: "https://x.com", icon: FaXTwitter },
  { label: "YouTube", href: "https://youtube.com", icon: FaYoutube },
];

export default function FooterBrand({ name, text }) {
  return (
    <div className="flex flex-col items-start gap-5">
      <Link
        to="/"
        className="flex items-center w-[120px] gap-3 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        aria-label={`${name} home`}
      >
<img className='w-full rounded-[20px]' src="./img/Logo-2.png" alt="" /> 

      </Link>

      <p className="max-w-sm text-sm leading-7 text-gray-400">{text}</p>

      <ul className="flex items-center gap-3">
        {SOCIALS.map(({ label, href, icon: Icon }) => (
          <li key={label}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300 transition hover:-translate-y-0.5 hover:border-[#8f1a36] hover:bg-[#8f1a36] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <Icon size={16} />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}