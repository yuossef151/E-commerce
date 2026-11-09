import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { User, Heart, ShoppingCart, Package, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../Supabase";
import { getWishlist, getCart } from "../../API/API";

export default function ProfileAndLogin() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchCounts = async () => {
    try {
      const wishlistItems = await getWishlist();
      setWishlistCount(wishlistItems.length);
    } catch {
      setWishlistCount(0);
    }

    try {
      const cartItems = await getCart();
      setCartCount(cartItems.length);
    } catch {
      setCartCount(0);
    }
  };

  useEffect(() => {
    async function initUser() {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await fetchCounts();
      }
      setLoading(false);
    }

    initUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          await fetchCounts();
        } else {
          setWishlistCount(0);
          setCartCount(0);
        }
      }
    );

    const handleWishlistUpdate = () => fetchCounts();
    const handleCartUpdate = () => fetchCounts();

    window.addEventListener("wishlistUpdated", handleWishlistUpdate);
    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
    navigate("/Login");
  };

  if (loading) {
    return null; 
  }

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      {user ? (
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Wishlist Icon */}
          <NavLink
            to="/wishlist"
            className={({ isActive }) =>
              `transition cursor-pointer relative ${
                isActive ? "text-[#8A1C38]" : "text-gray-700 hover:text-[#8A1C38]"
              }`
            }
            title="Wishlist"
          >
            {({ isActive }) => (
              <>
                <Heart size={22} className={`sm:w-6 sm:h-6 ${isActive ? "text-[#8A1C38]" : ""}`} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[9px] sm:text-[10px] font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-md">
                    {wishlistCount}
                  </span>
                )}
              </>
            )}
          </NavLink>

          {/* Cart Icon with Counter */}
          <NavLink
            to="/cart"
            className={({ isActive }) =>
              `transition cursor-pointer relative ${
                isActive ? "text-[#8A1C38]" : "text-gray-700 hover:text-[#8A1C38]"
              }`
            }
            title="Cart"
          >
            {({ isActive }) => (
              <>
                <ShoppingCart size={22} className={`sm:w-6 sm:h-6 ${isActive ? "text-[#8A1C38]" : ""}`} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[9px] sm:text-[10px] font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-md">
                    {cartCount}
                  </span>
                )}
              </>
            )}
          </NavLink>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-1 text-gray-700 hover:text-[#8A1C38] transition cursor-pointer focus:outline-none"
              title="Profile Menu"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                <User size={18} className="sm:w-[22px] sm:h-[22px]" />
              </div>
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute right-0 mt-3 w-48 bg-white border border-gray-100 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden"
                >
                  <NavLink
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#8A1C38] transition"
                  >
                    <User size={18} />
                    <span className="font-medium">Profile</span>
                  </NavLink>

                  <NavLink
                    to="/Order"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#8A1C38] transition"
                  >
                    <Package size={18} />
                    <span className="font-medium">Orders</span>
                  </NavLink>

                  <div className="h-[1px] bg-gray-100 my-1" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition cursor-pointer text-left"
                  >
                    <LogOut size={18} />
                    <span className="font-medium">Logout</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <div className="flex gap-2 sm:gap-3">
          <button className="text-white bg-[#8A1C38] font-medium text-sm sm:text-[18px] py-1.5 px-3 sm:py-2 sm:px-4 rounded-xl sm:rounded-[15px] hover:bg-[#a52243] transition">
            <NavLink to={"Login"}>Login</NavLink>
          </button>
          <button className="bg-[#8A1C38] text-white font-medium text-sm sm:text-[18px] py-1.5 px-3 sm:py-2 sm:px-4 rounded-xl sm:rounded-[15px] hover:bg-[#a52243] transition">
            <NavLink to={"Regester"}>Signup</NavLink>
          </button>
        </div>
      )}
    </div>
  );
}