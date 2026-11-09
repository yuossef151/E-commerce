import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  LogOut,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import { getMyProfile, updateMyProfile, getMyOrders, signOut } from "../API/API";

const validationSchema = Yup.object({
  full_name: Yup.string()
    .trim()
    .min(2, "Please enter your full name")
    .max(100, "Name is too long")
    .required("Full name is required"),
  phone: Yup.string()
    .trim()
    .max(20, "Phone number is too long")
    .matches(/^[+()\d\s-]*$/, {
      message: "Use digits, spaces, + ( ) or - only",
      excludeEmptyString: true,
    })
    .test(
      "min-digits",
      "Phone number is too short",
      (v) => !v || v.replace(/\D/g, "").length >= 7
    ),
  address: Yup.string().trim().max(300, "Address is too long"),
});

// Colour for each order status (matches whatever text your dashboard saves)
function statusStyle(status) {
  const s = (status || "").toLowerCase();
  if (["delivered", "completed", "resolved"].includes(s))
    return "bg-emerald-100 text-emerald-700";
  if (["shipped", "processing"].includes(s)) return "bg-blue-100 text-blue-700";
  if (["cancelled", "canceled"].includes(s)) return "bg-red-100 text-red-700";
  if (s === "pending") return "bg-amber-100 text-amber-700";
  return "bg-gray-100 text-gray-600";
}

const money = (n) => `$${Number(n || 0).toFixed(2)}`;

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();

  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const savedTimer = useRef(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const p = await getMyProfile();
        if (!alive) return;

        // Not signed in: send to login, and come back here afterwards
        if (!p) {
          navigate("/login", { replace: true, state: { from: location } });
          return;
        }

        setProfile(p);

        // A failure in orders should not break the whole page
        const o = await getMyOrders(p.id).catch(() => []);
        if (alive) setOrders(o);
      } catch (err) {
        console.error("Profile load error:", err);
        if (alive) setLoadError("We couldn’t load your profile. Please refresh the page.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
      clearTimeout(savedTimer.current);
    };
  }, [navigate, location]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      full_name: profile?.full_name ?? "",
      phone: profile?.phone ?? "",
      address: profile?.address ?? "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setSaved(false);
      setSaveError("");

      const clean = {
        full_name: values.full_name.trim(),
        phone: values.phone.trim() || null,
        address: values.address.trim() || null,
      };

      try {
        await updateMyProfile(clean);
        setProfile((prev) => ({ ...prev, ...clean }));
        setSaved(true);
        clearTimeout(savedTimer.current);
        savedTimer.current = setTimeout(() => setSaved(false), 3000);
      } catch (err) {
        console.error("Profile save error:", err);
        setSaveError("We couldn’t save your changes. Please try again.");
      }
    },
  });

  const { values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting, dirty } =
    formik;

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Sign out error:", err);
      setSigningOut(false);
    }
  };

  const fieldClass = (hasError) =>
    `w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition focus:outline-none focus:ring-2 ${
      hasError
        ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
        : "border-gray-300 focus:border-[#8f1a36] focus:ring-[#8f1a36]/20"
    }`;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-gray-500">
        <Loader2 className="animate-spin text-[#8f1a36]" size={36} />
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (loadError || !profile) {
    return (
      <div className=" px-4 py-16">
        <div
          role="alert"
          className="mx-auto flex max-w-md items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{loadError || "Profile not found."}</span>
        </div>
      </div>
    );
  }

  const displayName = profile.full_name || "Your account";
  const initial = (profile.full_name || profile.email || "?").trim().charAt(0).toUpperCase();
  const memberSince = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
      })
    : null;

  return (
    <main className="w-full pb-12 pt-[100px] bg-gray-200">
      {/* HEADER CARD */}
      <section className="w-full py-8">
        <div className=" px-4">
          <div className="relative overflow-hidden mb-10 rounded-[28px] border border-white/10 bg-gradient-to-br from-[#14152a] via-[#111827] to-[#08090d] p-7 text-white shadow-[0_25px_80px_rgba(0,0,0,0.35)] md:p-10">
            <div className="absolute  -right-20 top-1/2 h-[360px] w-[360px] -translate-y-1/2 rounded-full bg-[#c0405c]/25 blur-[100px] pointer-events-none" />

            <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-5">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#8f1a36] text-2xl font-extrabold ring-4 ring-white/10 md:h-20 md:w-20 md:text-3xl">
                  {initial}
                </span>
                <div className="min-w-0">
                  <h1 className="truncate text-2xl font-extrabold tracking-tight md:text-3xl">
                    {displayName}
                  </h1>
                  <p className="truncate text-sm text-gray-400">{profile.email}</p>
                  {memberSince && (
                    <p className="mt-1 text-xs uppercase tracking-wider text-[#ff6b8a]">
                      Member since {memberSince}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-bold transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {signingOut ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <LogOut size={16} />
                )}
                Sign out
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full">
        <div className=" mx-auto grid gap-4 px-4 lg:grid-cols-5">
          {/* DETAILS FORM */}
          <div className="rounded-[28px] border border-gray-200 bg-white p-7 shadow-sm md:p-9 lg:col-span-3">
            <h2 className="text-2xl font-extrabold text-[#8f1a36]">Personal details</h2>
            <p className="mt-1 text-sm text-gray-500">
              We use these details to deliver your orders.
            </p>

            {saved && (
              <div
                role="status"
                className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"
              >
                <CheckCircle2 size={18} className="shrink-0" />
                Your details were saved.
              </div>
            )}

            {saveError && (
              <div
                role="alert"
                className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                <AlertCircle size={18} className="mt-0.5 shrink-0 " />
                <span>{saveError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-semibold text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={profile.email || ""}
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500"
                />
                <p className="text-xs text-gray-400">Your email can’t be changed here.</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="full_name" className="text-sm font-semibold text-gray-700">
                  Full name
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  autoComplete="name"
                  placeholder="John Smith"
                  value={values.full_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!(touched.full_name && errors.full_name)}
                  aria-describedby={touched.full_name && errors.full_name ? "full_name-error" : undefined}
                  className={fieldClass(touched.full_name && errors.full_name)}
                />
                {touched.full_name && errors.full_name && (
                  <p id="full_name-error" className="text-xs text-red-600">
                    {errors.full_name}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                  Phone <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+1 555 123 4567"
                  value={values.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!(touched.phone && errors.phone)}
                  aria-describedby={touched.phone && errors.phone ? "phone-error" : undefined}
                  className={fieldClass(touched.phone && errors.phone)}
                />
                {touched.phone && errors.phone && (
                  <p id="phone-error" className="text-xs text-red-600">
                    {errors.phone}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="address" className="text-sm font-semibold text-gray-700">
                  Delivery address <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  autoComplete="street-address"
                  placeholder="Street, building, city"
                  value={values.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!(touched.address && errors.address)}
                  aria-describedby={touched.address && errors.address ? "address-error" : undefined}
                  className={`${fieldClass(touched.address && errors.address)} resize-y`}
                />
                {touched.address && errors.address && (
                  <p id="address-error" className="text-xs text-red-600">
                    {errors.address}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !dirty}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#8f1a36] px-6 py-3.5 font-bold text-white transition hover:bg-[#a82244] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8f1a36] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:self-start"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save changes"
                )}
              </button>
            </form>
          </div>

          {/* RECENT ORDERS */}
          <div className="rounded-[28px] border border-gray-200 bg-white p-7 shadow-sm md:p-9 lg:col-span-2">
            <h2 className="text-2xl font-extrabold text-gray-900">Recent orders</h2>

            {orders.length === 0 ? (
              <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-300 px-4 py-10 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8f1a36]/10 text-[#8f1a36]">
                  <ShoppingBag size={22} />
                </span>
                <p className="font-bold text-gray-900">No orders yet</p>
                <p className="text-sm text-gray-500">
                  When you place an order, it will show up here.
                </p>
                <Link
                  to="/Shop"
                  className="mt-1 inline-flex items-center gap-2 text-sm font-bold text-[#8f1a36] hover:underline"
                >
                  Start shopping
                  <ArrowRight size={16} />
                </Link>
              </div>
            ) : (
              <ul className="mt-6 divide-y divide-gray-100">
                {orders.map((order) => (
                  <li key={order.id} className="flex items-center justify-between gap-3 py-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-gray-900">
                        Order #{String(order.id).slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.created_at
                          ? new Date(order.created_at).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="text-sm font-extrabold text-gray-900">
                        {money(order.total_amount)}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusStyle(
                          order.status
                        )}`}
                      >
                        {order.status || "pending"}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}