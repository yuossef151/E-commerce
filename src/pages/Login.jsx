import { useState } from "react";
import { Link, useLocation, useNavigate, NavLink } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Loader2, AlertCircle, EyeOff, Eye } from "lucide-react";
import { loginUser, checkIsAdmin } from "../API/API";

const validationSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email("Enter a valid email, for example name@example.com")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

function getAuthErrorMessage(error) {
  const msg = (error?.message || "").toLowerCase();

  if (msg.includes("invalid login credentials")) {
    return "Incorrect email or password. Check your details and try again.";
  }
  if (msg.includes("email not confirmed")) {
    return "Your email isn't confirmed yet. Open the confirmation email we sent you, then sign in.";
  }
  if (error?.status === 429 || msg.includes("rate limit")) {
    return "Too many attempts. Wait a moment and try again.";
  }
  if (msg.includes("failed to fetch") || msg.includes("network")) {
    return "Can't reach the server. Check your internet connection and try again.";
  }
  return "Something went wrong while signing in. Please try again.";
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const redirectTo = location.state?.from?.pathname || "/";

  const formik = useFormik({
    initialValues: { email: "", password: "", remember: false },
    validationSchema,
    onSubmit: async (values) => {
      setServerError("");

      const { data, error } = await loginUser(values.email, values.password);

      if (error) {
        setServerError(getAuthErrorMessage(error));
        return;
      }

      const { adminData } = await checkIsAdmin(data.user.email);

      if (adminData) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate(redirectTo, { replace: true });
      }
    },
  });

  const { values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting } =
    formik;

  const emailError = touched.email && errors.email;
  const passwordError = touched.password && errors.password;

  return (
    <main className="min-h-screen bg-gray-100 text-gray-800 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 pt-24">
      {/* البطاقة الرئيسية بتصميم مقسم ومتجاوب */}
      <div className="w-full max-w-4xl bg-white border border-gray-200 rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        
        {/* القسم الأيسر: نموذج تسجيل الدخول */}
        <div className="p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
          <header className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#8A1C38]">Login</h1>
          </header>

          {serverError && (
            <div
              role="alert"
              className="flex items-start gap-2 mb-5 p-3 rounded-xl bg-red-600/10 border border-red-600/40 text-red-600 text-sm"
            >
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-xs font-medium text-gray-500">
                Email*
              </label>
              <input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder=""
                value={values.email}
                onChange={(e) => {
                  handleChange(e);
                  if (serverError) setServerError("");
                }}
                onBlur={handleBlur}
                className={`w-full bg-white border rounded-lg px-4 py-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-red-600/40 transition ${
                  emailError ? "border-red-500" : "border-gray-300 focus:border-[#8A1C38]"
                }`}
              />
              {emailError && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-xs font-medium text-gray-500">
                Password*
              </label>
              <div className="relative flex items-center">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder=""
                  value={values.password}
                  onChange={(e) => {
                    handleChange(e);
                    if (serverError) setServerError("");
                  }}
                  onBlur={handleBlur}
                  className={`w-full bg-white border rounded-lg px-4 py-3 pr-12 text-sm text-black focus:outline-none focus:ring-2 focus:ring-red-600/40 transition ${
                    passwordError ? "border-red-500" : "border-gray-300 focus:border-[#8A1C38]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-gray-400 hover:text-black transition cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordError && <p className="text-xs text-red-500">{errors.password}</p>}
            </div>

            <div className="flex items-center gap-3 my-1">
              <label className="relative flex items-center gap-2 cursor-pointer select-none">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  onChange={handleChange}
                  checked={values.remember}
                  className="w-5 h-5 rounded-md accent-[#8A1C38] cursor-pointer"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
            </div>

            {/* زر تسجيل الدخول */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#8A1C38] hover:bg-[#a52243] text-white font-semibold transition shadow-lg shadow-red-950/20 disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          {/* وسائل تسجيل الدخول البديلة */}
          <div className="mt-8 text-center">
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-gray-500">Or login with</span>
              </div>
            </div>
            <div className="flex justify-center gap-4">
              <button 
                aria-label="Sign in with Google" 
                className="w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition cursor-pointer shadow-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
              </button>
              <button 
                aria-label="Sign in with Facebook" 
                className="w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition cursor-pointer shadow-sm"
              >
                <svg className="w-5 h-5 fill-[#1877F2]" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
              <button 
                aria-label="Sign in with Instagram" 
                className="w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition cursor-pointer shadow-sm"
              >
                <svg className="w-5 h-5 fill-[#E4405F]" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* القسم الأيمن: البانر الترحيبي بلون أحمر غامق */}
        <div className="bg-[#8A1C38] p-8 sm:p-12 lg:p-16 flex flex-col items-center justify-center text-center text-white relative">
          <div className="max-w-sm">
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">Welcome back!</h2>
            <p className="text-sm text-red-100/90 leading-relaxed mb-8">
              "Welcome back! We're thrilled to see you again. Log in and resume your journey into the world of exclusive shopping. Your next great find could be just a click away. Happy shopping!"
            </p>
            
            <NavLink
              to="/Regester"
              className="inline-block px-6 py-2.5 rounded-full border border-white/40 text-xs font-semibold hover:bg-white/10 transition"
            >
              Don't have an account? Signup here
            </NavLink>
          </div>
        </div>

      </div>
    </main>
  );
}