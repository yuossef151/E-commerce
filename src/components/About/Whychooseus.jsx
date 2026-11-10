import {
  ShieldCheck,
  Truck,
  Banknote,
  BadgeCheck,
  RotateCcw,
  Headset,
} from "lucide-react";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "100% original products",
    text: "Every device comes from official brands and trusted suppliers. No copies, no surprises.",
  },
  {
    icon: Truck,
    title: "Fast, careful delivery",
    text: "Your order is packed with care and shipped quickly to your door.",
  },
  {
    icon: Banknote,
    title: "Cash on delivery",
    text: "Pay when your order arrives. Check it first, then pay.",
  },
  {
    icon: BadgeCheck,
    title: "Warranty included",
    text: "Our products are covered by a warranty, so you are protected after you buy.",
  },
  {
    icon: RotateCcw,
    title: "Easy returns",
    text: "Changed your mind or got a faulty item? Contact us and we will sort it out.",
  },
  {
    icon: Headset,
    title: "Friendly support",
    text: "Real people answer your questions before and after your purchase.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="w-full py-8">
      <div className="lg:px-10 px-4">
        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-bold tracking-[3px] uppercase text-gray-900">
            Why choose us
          </p>
          <h2 className="mt-2 text-3xl md:text-4xl font-extrabold tracking-tight text-[#8f1a36]">
            Shopping tech should feel easy
          </h2>
          <p className="mt-3 text-gray-600 leading-7">
            We focus on the things that matter most when you buy electronics:
            trust, speed and support.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="group rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8f1a36]/10 text-[#8f1a36] transition group-hover:bg-[#8f1a36] group-hover:text-white">
                <Icon size={22} />
              </span>
              <h3 className="mt-4 text-lg font-bold text-gray-900">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}