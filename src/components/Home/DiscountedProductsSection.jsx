import { useState, useEffect } from "react";
import { getDiscountedProducts, getWishlist, addToWishlist, removeFromWishlist } from "../../API/API";
import { Heart, Loader2 } from "lucide-react";
import { supabase } from "../../Supabase";
import { notifyLoginFirst, notifyAddedToWishlist, notifyRemovedFromWishlist, notifyError } from "../../utils/toastService";
import CartControl from "../Cart/Cartcontrol";

const THIRTY_DAYS_IN_SECONDS = 30 * 24 * 60 * 60;

export default function DiscountedProductsSection({ onLoaded }) {
  const [discountedProducts, setDiscountedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(THIRTY_DAYS_IN_SECONDS);
  const [favorites, setFavorites] = useState({});
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await getDiscountedProducts();
        setDiscountedProducts(data || []);

        const campaignKey = "global_offers_end_time";
        let savedEndTime = localStorage.getItem(campaignKey);
        const now = Date.now();

        if (savedEndTime && Number(savedEndTime) > now) {
          const remainingSeconds = Math.floor((Number(savedEndTime) - now) / 1000);
          setTimeLeft(remainingSeconds);
        } else {
          const newEndTime = now + THIRTY_DAYS_IN_SECONDS * 1000;
          localStorage.setItem(campaignKey, newEndTime);
          setTimeLeft(THIRTY_DAYS_IN_SECONDS);
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const wishlistItems = await getWishlist();
          const favsMap = {};
          wishlistItems.forEach((item) => {
            favsMap[item.product_id] = true;
          });
          setFavorites(favsMap);
        }
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
        onLoaded?.();
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const toggleFavorite = async (productId) => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      notifyLoginFirst();
      return;
    }

    const isAlreadyFavorite = favorites[productId];

    try {
      setActionLoadingId(productId);

      if (isAlreadyFavorite) {
        await removeFromWishlist(productId);
        setFavorites((prev) => {
          const updated = { ...prev };
          delete updated[productId];
          return updated;
        });
        notifyRemovedFromWishlist();
      } else {
        await addToWishlist(productId);
        setFavorites((prev) => ({
          ...prev,
          [productId]: true,
        }));
        notifyAddedToWishlist();
      }

      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (err) {
      console.error("Error updating wishlist:", err);
      notifyError();
    } finally {
      setActionLoadingId(null);
    }
  };

  const days = Math.floor(timeLeft / (24 * 60 * 60));
  const hours = Math.floor((timeLeft % (24 * 60 * 60)) / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const timeUnits = [
    { label: "DAYS", value: days },
    { label: "HOURS", value: hours },
    { label: "MINUTES", value: minutes },
    { label: "SECONDS", value: seconds },
  ];

  if (loading) return null;

  if (!discountedProducts || discountedProducts.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl mb-6 sm:mb-8 bg-gradient-to-r from-[#5d1025] via-[#8A1C38] to-[#b52b4d] p-5 sm:p-6 md:p-8 shadow-xl">
        <div className="absolute -top-20 -right-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-10 w-64 h-64 rounded-full bg-black/20 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-3 sm:px-4 py-1 sm:py-1.5 mb-2 sm:mb-3">
              <span className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse" />
              <span className="text-white/90 text-[10px] sm:text-xs font-bold tracking-widest">
                LIMITED TIME DEALS
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-1 sm:mb-2">Special Offers</h2>
            <p className="text-white/75 text-xs sm:text-sm md:text-base">
              Don't miss out! Grab your favorite deals before time runs out.
            </p>
          </div>

          {/* عداد الوقت متجاوب تماماً */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap justify-center">
            {timeUnits.map((unit, index) => (
              <div key={unit.label} className="flex items-center gap-1.5 sm:gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-[50px] h-[58px] sm:w-[62px] sm:h-[70px] md:w-[76px] md:h-[82px] flex items-center justify-center rounded-xl sm:rounded-2xl bg-white/15 border border-white/20 backdrop-blur-md shadow-lg">
                    <span className="text-xl sm:text-2xl md:text-3xl font-black text-white tabular-nums">
                      {String(unit.value).padStart(2, "0")}
                    </span>
                  </div>
                  <span className="text-[8px] sm:text-[9px] md:text-[10px] font-bold tracking-widest text-white/75 mt-1.5 sm:mt-2">
                    {unit.label}
                  </span>
                </div>
                {index !== timeUnits.length - 1 && (
                  <span className="text-white/70 text-lg sm:text-xl font-bold -mt-4 sm:-mt-5">:</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* شبكة عرض المنتجات المخفضة */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {discountedProducts.map((prod) => {
          const discountPercent =
            prod.price && prod.discount_price
              ? Math.round(((prod.price - prod.discount_price) / prod.price) * 100)
              : 0;

          const isFavorite = favorites[prod.id] || false;
          const isThisProductLoading = actionLoadingId === prod.id;

          return (
            <div
              key={prod.id}
              className="bg-white border flex flex-col border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition justify-between relative overflow-hidden"
            >
              {discountPercent > 0 && (
                <span className="absolute top-3 left-3 bg-red-600 text-white text-[11px] sm:text-xs font-bold px-2.5 py-0.5 sm:py-1 rounded-full shadow-md z-10">
                  -{discountPercent}%
                </span>
              )}

              <button
                onClick={() => !isThisProductLoading && toggleFavorite(prod.id)}
                disabled={isThisProductLoading}
                className="absolute top-3 right-3 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/80 hover:bg-white backdrop-blur-md shadow-md flex items-center justify-center z-10 transition-transform active:scale-90 cursor-pointer disabled:opacity-70"
                aria-label="Add to favorites"
              >
                {isThisProductLoading ? (
                  <Loader2 size={16} className="animate-spin text-[#8A1C38]" />
                ) : (
                  <Heart
                    size={18}
                    className={`transition-colors duration-200 ${
                      isFavorite ? "text-red-500 fill-red-500" : "text-gray-400 hover:text-gray-600"
                    }`}
                  />
                )}
              </button>

              <div className="flex w-full items-center justify-center py-2">
                <img
                  src={prod.image_url}
                  alt={prod.name}
                  className="w-40 sm:w-48 h-40 sm:h-48 object-cover rounded-xl mb-3"
                />
              </div>

              <div>
                <h3 className="font-bold text-base sm:text-lg mb-1 truncate text-gray-900">{prod.name}</h3>
                <div className="flex flex-wrap justify-between items-center gap-2 mt-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-lg sm:text-xl font-bold text-[#8A1C38]">${prod.discount_price}</span>
                    <span className="text-xs sm:text-sm text-gray-400 line-through">${prod.price}</span>
                  </div>

                  <CartControl productId={prod.id} stock={prod.stock} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}