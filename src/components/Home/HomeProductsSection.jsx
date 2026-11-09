import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts, getWishlist, addToWishlist, removeFromWishlist } from "../../API/API";
import { Heart, Loader2 } from "lucide-react";
import { notifyLoginFirst, notifyAddedToWishlist, notifyRemovedFromWishlist, notifyError } from "../../utils/toastService";
import CartControl from "../Cart/Cartcontrol";
import { supabase } from "../../Supabase";

export default function HomeProductsSection({ onLoaded }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState({});
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    async function loadHomeProducts() {
      try {
        setLoading(true);
        const [productsData, sessionData] = await Promise.all([
          getProducts(),
          supabase.auth.getSession()
        ]);

        setProducts(productsData ? productsData.slice(0, 8) : []);

        if (sessionData.data.session?.user) {
          const wishlistItems = await getWishlist();
          const favsMap = {};
          wishlistItems.forEach((item) => {
            favsMap[item.product_id] = true;
          });
          setFavorites(favsMap);
        }
      } catch (err) {
        setError("Failed to load products.");
      } finally {
        setLoading(false);
        if (onLoaded) onLoaded(); 
      }
    }

    loadHomeProducts();
  }, []);

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

  if (loading) {
    return <div className="text-center py-10 text-gray-600">Loading products...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500 font-medium">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="flex justify-between items-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl md:text-[40px] font-bold text-[#8A1C38]">Featured Products</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.map((product) => {
          const discountPercent = product.price && product.discount_price 
            ? Math.round(((product.price - product.discount_price) / product.price) * 100)
            : 0;

          const isFavorite = favorites[product.id] || false;
          const isThisProductLoading = actionLoadingId === product.id;

          return (
            <div key={product.id} className="bg-white border flex flex-col border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition justify-between relative overflow-hidden">
              {discountPercent > 0 && (
                <span className="absolute top-3 left-3 bg-red-600 text-white text-[11px] sm:text-xs font-bold px-2.5 py-0.5 sm:py-1 rounded-full shadow-md z-10">
                  -{discountPercent}%
                </span>
              )}

              <button
                onClick={() => !isThisProductLoading && toggleFavorite(product.id)}
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
                  src={product.image_url}
                  alt={product.name}
                  className="w-40 sm:w-48 h-40 sm:h-48 object-cover rounded-xl mb-3"
                />
              </div>

              <div>
                <h3 className="font-bold text-base sm:text-lg mb-1 truncate text-gray-900">{product.name}</h3>
                <div className="flex flex-wrap justify-between items-center gap-2 mt-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-lg sm:text-xl font-bold text-[#8A1C38]">
                      ${product.discount_price ?? product.price}
                    </span>
                    {product.discount_price && (
                      <span className="text-xs sm:text-sm text-gray-400 line-through">
                        ${product.price}
                      </span>
                    )}
                  </div>

                  <CartControl productId={product.id} stock={product.stock} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

            <div className="flex justify-center mt-12">
        <Link
          to="/Shop"
          className="bg-[#8A1C38] hover:bg-[#621428] text-white px-8 py-3 rounded-xl font-semibold transition shadow-lg cursor-pointer"
        >
          View All
        </Link>
      </div>
    </div>
  );
}



