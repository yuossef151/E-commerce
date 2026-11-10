import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { sendContactMessage } from "../../API/API";

const CONTACT = {
  email: "support@techhub.example",
  phone: "+1 (555) 013-4567",
  address: "24 Innovation Street, Tech District",
  hours: "Sat to Thu, 10:00 to 18:00",
};

const MAX_MESSAGE = 1000;
const COOLDOWN_MS = 30000; 
const COOLDOWN_KEY = "contact_last_sent";

const validationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, "Please enter your name")
    .max(100, "Name is too long")
    .required("Name is required"),
  email: Yup.string()
    .trim()
    .email("Enter a valid email, for example name@example.com")
    .max(200, "Email is too long")
    .required("Email is required"),
  message: Yup.string()
    .trim()
    .min(10, "Your message should be at least 10 characters")
    .max(MAX_MESSAGE, `Keep your message under ${MAX_MESSAGE} characters`)
    .required("Message is required"),
});

function isCoolingDown() {
  try {
    const last = Number(localStorage.getItem(COOLDOWN_KEY) || 0);
    return Date.now() - last < COOLDOWN_MS;
  } catch {
    return false;
  }
}

function markSent() {
  try {
    localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
  } catch {
  }
}

export default function ContactForm() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState("");

  const formik = useFormik({
    initialValues: { name: "", email: "", message: "", website: "" },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      setServerError("");

      if (values.website) {
        setSent(true);
        resetForm();
        return;
      }

      if (isCoolingDown()) {
        setServerError("Please wait a few seconds before sending another message.");
        return;
      }

      try {
        await sendContactMessage({
          name: values.name.trim(),
          email: values.email.trim().toLowerCase(),
          message: values.message.trim(),
        });
        markSent();
        setSent(true);
        resetForm();
      } catch (err) {
        console.error("Contact form error:", err);
        setServerError(
          "We couldn’t send your message. Please try again in a moment."
        );
      }
    },
  });

  const { values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting } =
    formik;

  const fieldClass = (hasError) =>
    `w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition focus:outline-none focus:ring-2 ${
      hasError
        ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
        : "border-gray-300 focus:border-[#8f1a36] focus:ring-[#8f1a36]/20"
    }`;

  const info = [
    { icon: Mail, label: "Email", value: CONTACT.email },
    { icon: Phone, label: "Phone", value: CONTACT.phone },
    { icon: MapPin, label: "Address", value: CONTACT.address },
    { icon: Clock, label: "Working hours", value: CONTACT.hours },
  ];

  return (
    <section id="contact" className="w-full py-8 scroll-mt-6">
      <div className="lg:px-10 px-4">
        <div className="grid gap-4 lg:grid-cols-5">
          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-[#6b1128] via-[#8f1a36] to-[#c0405c] p-7 text-white shadow-lg lg:col-span-2 md:p-9">
            <div className="absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

            <p className="relative text-xs font-bold tracking-[3px] uppercase text-white/70">
              Contact us
            </p>
            <h2 className="relative mt-2 text-3xl font-extrabold tracking-tight">
              Let’s talk
            </h2>
            <p className="relative mt-3 text-sm leading-7 text-white/80">
              Questions about a product, an order or a return? Send us a message
              and we will get back to you by email.
            </p>

            <ul className="relative mt-8 space-y-5">
              {info.map(({ icon: Icon, label, value }) => (
                <li key={label} className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                    <Icon size={18} />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-white/60">
                      {label}
                    </p>
                    <p className="text-sm font-semibold">{value}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[28px] border border-gray-200 bg-white p-7 shadow-sm lg:col-span-3 md:p-9">
            {sent ? (
              <div
                role="status"
                className="flex h-full min-h-[360px] flex-col items-center justify-center gap-4 text-center"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 size={34} />
                </span>
                <h3 className="text-2xl font-extrabold text-gray-900">
                  Message sent
                </h3>
                <p className="max-w-sm text-sm leading-7 text-gray-600">
                  Thank you for contacting us. We will reply to your email as
                  soon as we can.
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="mt-2 cursor-pointer rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-bold text-gray-800 transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8f1a36]"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-extrabold text-[#8f1a36]">
                  Send us a message
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  All fields are required.
                </p>

                {serverError && (
                  <div
                    role="alert"
                    className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                  >
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                    <span>{serverError}</span>
                  </div>
                )}

                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="mt-6 flex flex-col gap-5"
                >
                  <div className="absolute -left-[9999px]" aria-hidden="true">
                    <label htmlFor="website">Website</label>
                    <input
                      id="website"
                      name="website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={values.website}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="name"
                        className="text-sm font-semibold text-gray-700"
                      >
                        Your name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        placeholder="John Smith"
                        value={values.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        aria-invalid={!!(touched.name && errors.name)}
                        aria-describedby={
                          touched.name && errors.name ? "name-error" : undefined
                        }
                        className={fieldClass(touched.name && errors.name)}
                      />
                      {touched.name && errors.name && (
                        <p id="name-error" className="text-xs text-red-600">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="email"
                        className="text-sm font-semibold text-gray-700"
                      >
                        Your email
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        placeholder="name@example.com"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        aria-invalid={!!(touched.email && errors.email)}
                        aria-describedby={
                          touched.email && errors.email ? "email-error" : undefined
                        }
                        className={fieldClass(touched.email && errors.email)}
                      />
                      {touched.email && errors.email && (
                        <p id="email-error" className="text-xs text-red-600">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="message"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Your message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      placeholder="How can we help you?"
                      value={values.message}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      aria-invalid={!!(touched.message && errors.message)}
                      aria-describedby={
                        touched.message && errors.message ? "message-error" : undefined
                      }
                      className={`${fieldClass(
                        touched.message && errors.message
                      )} resize-y`}
                    />
                    <div className="flex items-start justify-between gap-3">
                      <p id="message-error" className="text-xs text-red-600">
                        {touched.message && errors.message ? errors.message : ""}
                      </p>
                      <span className="shrink-0 text-xs text-gray-400">
                        {values.message.length}/{MAX_MESSAGE}
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#8f1a36] px-6 py-3.5 font-bold text-white transition hover:bg-[#a82244] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8f1a36] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:self-start"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Send message
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}