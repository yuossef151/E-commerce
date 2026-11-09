import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  ShoppingCart,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Banknote,
  ArrowRight,
} from "lucide-react";
import {
  getMyProfile,
  updateMyProfile,
  getCheckoutItems,
  checkout,
} from "../API/API";

const validationSchema = Yup.object({
  customer_name: Yup.string()
    .trim()
    .min(2, "Please enter your full name")
    .max(100, "Name is too long")
    .required("Full name is required"),
  phone: Yup.string()
    .trim()
    .max(20, "Phone number is too long")
    .matches(/^[+()\d\s-]+$/, "Use digits, spaces, + ( ) or - only")
    .test(
      "min-digits",
      "Phone number is too short",
      (v) => !!v && v.replace(/\D/g, "").length >= 7
    )
    .required("Phone number is required"),
  address: Yup.string()
    .trim()
    .min(5, "Please enter your full delivery address")
    .max(300, "Address is too long")
    .required("Delivery address is required"),
});

const money = (n) => `$${Number(n || 0).toFixed(2)}`;

const unitPrice = (p) => Number(p.discount_price || p.price || 0);

function friendlyError(err) {
  const msg = String(err?.message || "");
  if (msg.includes("insufficient stock")) {
    const name = msg.split(":")[1]?.trim();
    return `There isn’t enough stock for ${name || "one of the items"}. Please update your cart.`;
  }
  if (msg.includes("cart is empty")) return "Your cart is empty.";
  if (msg.includes("not authenticated"))
    return "Your session has expired. Please sign in again.";
  if (msg.includes("invalid"))
    return "Please check your details and try again.";
  return "We couldn’t place your order. Please try again in a moment.";
}

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [profile, setProfile] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [serverError, setServerError] = useState("");
  const [placed, setPlaced] = useState(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const p = await getMyProfile();
        if (!alive) return;

        if (!p) {
          navigate("/login", { replace: true, state: { from: location } });
          return;
        }

        setProfile(p);
        const cart = await getCheckoutItems();
        if (alive) setItems(cart);
      } catch (err) {
        console.error("Checkout load error:", err);
        if (alive) setLoadError("We couldn’t load your cart. Please refresh the page.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [navigate, location]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce(
    (sum, i) => sum + i.quantity * unitPrice(i.products),
    0
  );
  const stockProblem = items.find((i) => i.quantity > i.products.stock);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      customer_name: profile?.full_name ?? "",
      phone: profile?.phone ?? "",
      address: profile?.address ?? "",
      saveDetails: true,
    },
    validationSchema,
    onSubmit: async (values) => {
      setServerError("");

      const details = {
        customer_name: values.customer_name.trim(),
        phone: values.phone.trim(),
        address: values.address.trim(),
      };

      try {
        const orderId = await checkout(details);

        if (values.saveDetails) {
          updateMyProfile({
            full_name: details.customer_name,
            phone: details.phone,
            address: details.address,
          }).catch(() => {});
        }

        setPlaced({ id: orderId, total: totalPrice });
        setItems([]);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (err) {
        console.error("Checkout error:", err);
        setServerError(friendlyError(err));
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

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-gray-500">
        <Loader2 className="animate-spin text-[#8f1a36]" size={36} />
        <p>Loading checkout...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="container mx-auto px-4 py-24 sm:py-28">
        <div
          role="alert"
          className="mx-auto flex max-w-md items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{loadError}</span>
        </div>
      </div>
    );
  }

  // ORDER PLACED
  if (placed) {
    return (
      <main className="container mx-auto px-4 py-24 sm:py-28">
        <div
          role="status"
          className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-[28px] border border-gray-200 bg-white p-6 sm:p-8 md:p-12 text-center shadow-sm"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 size={34} />
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#8f1a36]">Order placed</h1>
          <p className="text-sm leading-7 text-gray-600">
            Thank you for your order. We will contact you to confirm the delivery.
          </p>

          <dl className="w-full divide-y divide-gray-100 rounded-2xl border border-gray-200 text-sm">
            <div className="flex justify-between px-4 py-3">
              <dt className="text-gray-500">Order number</dt>
              <dd className="font-bold text-gray-900">
                #{String(placed.id).slice(0, 8).toUpperCase()}
              </dd>
            </div>
            <div className="flex justify-between px-4 py-3">
              <dt className="text-gray-500">Total to pay</dt>
              <dd className="font-bold text-[#8f1a36]">{money(placed.total)}</dd>
            </div>
            <div className="flex justify-between px-4 py-3">
              <dt className="text-gray-500">Payment</dt>
              <dd className="font-bold text-gray-900">Cash on delivery</dd>
            </div>
          </dl>

          <div className="mt-2 flex w-full flex-col gap-3 sm:flex-row">
            <Link
              to="/Order"
              className="flex-1 rounded-xl bg-[#8f1a36] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#a82244] text-center"
            >
              View my orders
            </Link>
            <Link
              to="/shop"
              className="flex-1 rounded-xl border border-gray-300 px-5 py-3 text-sm font-bold text-gray-800 transition hover:bg-gray-50 text-center"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // EMPTY CART
  if (items.length === 0) {
    return (
      <main className="container mx-auto px-4 py-24 sm:py-28">
        <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-[28px] border border-gray-200 bg-white p-6 sm:p-10 text-center shadow-sm">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#8f1a36]/10 text-[#8f1a36]">
            <ShoppingCart size={26} />
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">Your cart is empty</h1>
          <p className="text-sm text-gray-500">Add a few products before you check out.</p>
          <Link
            to="/shop"
            className="mt-2 inline-flex items-center gap-2 rounded-xl bg-[#8f1a36] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#a82244]"
          >
            Go to shop
            <ArrowRight size={16} />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className=" lg:px-10 px-4 py-24 sm:py-28 pb-12  bg-gray-100">
      <h1 className="mb-6 sm:mb-8 flex items-center gap-3 text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#8f1a36]">
        <ShoppingCart size={30} className="sm:w-[34px] sm:h-[34px]" />
        Checkout
      </h1>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="grid items-start gap-6 lg:grid-cols-5"
      >
        {/* LEFT: shipping + payment */}
        <div className="flex flex-col gap-6 lg:col-span-3">
          <section className="rounded-2xl sm:rounded-[28px] border border-gray-200 bg-white p-5 sm:p-7 md:p-9 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Delivery details</h2>
            <p className="mt-1 text-xs sm:text-sm text-gray-500">
              Where should we send your order?
            </p>

            <div className="mt-5 sm:mt-6 flex flex-col gap-4 sm:gap-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="customer_name" className="text-xs sm:text-sm font-semibold text-gray-700">
                  Full name
                </label>
                <input
                  id="customer_name"
                  name="customer_name"
                  type="text"
                  autoComplete="name"
                  placeholder="John Smith"
                  value={values.customer_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!(touched.customer_name && errors.customer_name)}
                  aria-describedby={
                    touched.customer_name && errors.customer_name ? "customer_name-error" : undefined
                  }
                  className={fieldClass(touched.customer_name && errors.customer_name)}
                />
                {touched.customer_name && errors.customer_name && (
                  <p id="customer_name-error" className="text-xs text-red-600">
                    {errors.customer_name}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="phone" className="text-xs sm:text-sm font-semibold text-gray-700">
                  Phone number
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
                <label htmlFor="address" className="text-xs sm:text-sm font-semibold text-gray-700">
                  Delivery address
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

              <label className="flex cursor-pointer items-center gap-3 text-xs sm:text-sm text-gray-600 select-none">
                <input
                  type="checkbox"
                  name="saveDetails"
                  checked={values.saveDetails}
                  onChange={handleChange}
                  className="h-4 w-4 cursor-pointer accent-[#8f1a36]"
                />
                Save these details to my profile for next time
              </label>
            </div>
          </section>

          <section className="rounded-2xl sm:rounded-[28px] border border-gray-200 bg-white p-5 sm:p-7 md:p-9 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Payment</h2>
            <div className="mt-4 sm:mt-5 flex items-center gap-3 sm:gap-4 rounded-2xl border-2 border-[#8f1a36] bg-[#8f1a36]/5 p-4">
              <span className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-[#8f1a36] text-white">
                <Banknote size={20} />
              </span>
              <div>
                <p className="font-bold text-gray-900 text-sm sm:text-base">Cash on delivery</p>
                <p className="text-xs sm:text-sm text-gray-500">
                  Pay in cash when your order arrives.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT: summary */}
        <aside className="rounded-2xl sm:rounded-[28px] border border-gray-200 bg-white p-5 sm:p-7 md:p-9 shadow-sm lg:sticky lg:top-24 lg:col-span-2">
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Order summary</h2>

          <ul className="mt-4 sm:mt-5 divide-y divide-gray-100 max-h-[300px] sm:max-h-[350px] overflow-y-auto">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 sm:gap-4 py-3 sm:py-4">
                <span className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white p-1">
                  {item.products.image_url && (
                    <img
                      src={item.products.image_url}
                      alt=""
                      className="h-full w-full object-contain"
                    />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs sm:text-sm font-bold text-gray-900">
                    {item.products.name}
                  </p>
                  <p className="text-[11px] sm:text-xs text-gray-500">
                    {item.quantity} × {money(unitPrice(item.products))}
                  </p>
                  {item.quantity > item.products.stock && (
                    <p className="text-[11px] sm:text-xs font-semibold text-red-600">
                      Only {item.products.stock} left in stock
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-xs sm:text-sm font-extrabold text-gray-900">
                  {money(item.quantity * unitPrice(item.products))}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-2 space-y-2.5 sm:space-y-3 border-t border-gray-200 pt-4 sm:pt-5 text-sm">
            <div className="flex justify-between text-gray-600 text-xs sm:text-sm">
              <dt>Total items</dt>
              <dd className="font-bold text-gray-900">{totalItems}</dd>
            </div>
            <div className="flex justify-between text-base sm:text-lg">
              <dt className="font-bold text-gray-900">Total price</dt>
              <dd className="font-extrabold text-[#8f1a36]">{money(totalPrice)}</dd>
            </div>
          </dl>

          {serverError && (
            <div
              role="alert"
              className="mt-4 sm:mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs sm:text-sm text-red-700"
            >
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !!stockProblem}
            className="mt-5 sm:mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#8f1a36] px-6 py-3.5 sm:py-4 text-sm sm:text-base font-bold text-white transition hover:bg-[#a82244] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8f1a36] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Placing order...
              </>
            ) : (
              "Place order"
            )}
          </button>

          <Link
            to="/cart"
            className="mt-3 block text-center text-xs sm:text-sm font-semibold text-gray-500 hover:text-[#8f1a36]"
          >
            Back to cart
          </Link>
        </aside>
      </form>
    </main>
  );
}