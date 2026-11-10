import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "Are your products original?",
    a: "Yes. We only sell original devices from official brands and trusted suppliers.",
  },
  {
    q: "How long does delivery take?",
    a: "Delivery time depends on your city. We will confirm the expected date when we contact you about your order.",
  },
  {
    q: "How can I pay?",
    a: "You can pay in cash when your order arrives. You can check the product first, then pay.",
  },
  {
    q: "What if the product has a problem?",
    a: "Contact us and we will help you with a replacement or a return, depending on the warranty and the condition of the item.",
  },
  {
    q: "Can I change or cancel my order?",
    a: "Yes, as long as it has not been shipped yet. Send us a message from the form below as soon as possible.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section className="w-full py-8">
      <div className="lg:px-10 px-4">
        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-bold tracking-[3px] uppercase text-gray-900">
            FAQ
          </p>
          <h2 className="mt-2 text-3xl md:text-4xl font-extrabold tracking-tight text-[#8f1a36]">
            Questions people ask us
          </h2>
        </div>

        <div className="mx-auto max-w-3xl divide-y divide-gray-200 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q}>
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    id={`faq-button-${i}`}
                    className="flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left font-bold text-gray-900 transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#8f1a36]"
                  >
                    {item.q}
                    <ChevronDown
                      size={20}
                      className={`shrink-0 text-[#8f1a36] transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </h3>

                <div
                  id={`faq-panel-${i}`}
                  role="region"
                  aria-labelledby={`faq-button-${i}`}
                  className={`grid transition-[grid-template-rows] duration-300 ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-sm leading-7 text-gray-600">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}