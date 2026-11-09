import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Truck,
  Banknote,
  Headset,
  Mail,
  Phone,
  MapPin,
  Clock,
  ArrowUp,
} from "lucide-react";
import { supabase } from "../../Supabase"; // تأكد من مطابقة مسار استيراد سوبابيس لديك
import FooterBrand from "./Footerbrand";
import FooterColumn from "./Footercolumn";

// Demo details (made up): change them to your own
const BRAND = {
  name: "TechHub",
  text: "Original gaming gear, consoles, laptops and phones from trusted brands, delivered to your door with honest prices and real support.",
};

const CONTACT = {
  email: "support@techhub.example",
  phone: "+1 (555) 013-4567",
  address: "24 Innovation Street, Tech District",
  hours: "Sat to Thu, 10:00 to 18:00",
};

const EXPLORE = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/Shop" },
  { label: "About us", to: "/About" },
];

const PERKS = [
  { icon: ShieldCheck, title: "100% original", text: "Official brands only" },
  { icon: Truck, title: "Fast delivery", text: "Packed with care" },
  { icon: Banknote, title: "Cash on delivery", text: "Pay when it arrives" },
  { icon: Headset, title: "Friendly support", text: "We reply by email" },
];

export default function Footer() {
  const [user, setUser] = useState(null);
  const year = new Date().getFullYear();

  useEffect(() => {
    async function checkUserSession() {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    }

    checkUserSession();

    // الاستماع لتغيرات تسجيل الدخول والخروج فورياً
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // تحديد روابط الحساب بناءً على حالة تسجيل الدخول
  const accountLinks = user
    ? [
        { label: "Cart", to: "/cart" },
        { label: "Orders", to: "/Order" },
        { label: "My profile", to: "/profile" },
      ]
    : [
        { label: "Sign in", to: "/login" },
        { label: "Create account", to: "/Regester" },
        { label: "My profile", to: "/profile" },
      ];

  const contactItems = [
    { icon: Mail, label: "Email", value: CONTACT.email, href: `mailto:${CONTACT.email}` },
    {
      icon: Phone,
      label: "Phone",
      value: CONTACT.phone,
      href: `tel:${CONTACT.phone.replace(/[^\d+]/g, "")}`,
    },
    { icon: MapPin, label: "Address", value: CONTACT.address },
    { icon: Clock, label: "Working hours", value: CONTACT.hours },
  ];

  return (
    <footer className=" w-full bg-[#090a10] text-gray-400">
      {/* thin brand-colour line on top */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#8f1a36] to-transparent" />

      <div className="container mx-auto px-4">
        {/* PERKS STRIP */}
        <ul className="grid grid-cols-2 gap-4 border-b border-white/10 py-8 lg:grid-cols-4">
          {PERKS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#8f1a36]/15 text-[#ff6b8a]">
                <Icon size={20} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">{title}</p>
                <p className="truncate text-xs text-gray-500">{text}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* MAIN COLUMNS */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 py-12 md:grid-cols-4 lg:grid-cols-12">
          <div className="col-span-2 md:col-span-4 lg:col-span-4">
            <FooterBrand name={BRAND.name} text={BRAND.text} />
          </div>

          <div className="lg:col-span-2">
            <FooterColumn title="Explore" links={EXPLORE} />
          </div>

          <div className="lg:col-span-2">
            {/* تمرير الروابط الديناميكية بناءً على حالة الـ User */}
            <FooterColumn title="Account" links={accountLinks} />
          </div>

          <div className="col-span-2 lg:col-span-4">
            <h3 className="mb-5 text-xs font-bold uppercase tracking-[3px] text-white">
              Contact
            </h3>
            <ul className="space-y-4">
              {contactItems.map(({ icon: Icon, label, value, href }) => (
                <li key={label} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-[#ff6b8a]">
                    <Icon size={16} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wider text-gray-500">
                      {label}
                    </p>
                    {href ? (
                      <a
                        href={href}
                        className="break-words text-sm text-gray-300 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-300">{value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-6 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-gray-500">
            © {year} {BRAND.name}. All rights reserved.
          </p>

          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-gray-300 transition hover:border-[#8f1a36] hover:bg-[#8f1a36] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Back to top
            <ArrowUp size={14} />
          </button>
        </div>
      </div>
    </footer>
  );
}