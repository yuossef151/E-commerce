import { useEffect, useState } from "react";
import { getProducts, getCategories, getWishlist, addToWishlist, removeFromWishlist } from "../API/API";
import { Heart, Loader2 } from "lucide-react";
import { notifyLoginFirst, notifyAddedToWishlist, notifyRemovedFromWishlist, notifyError } from "../utils/toastService";
import CartControl from "../components/Cart/Cartcontrol";
import { supabase } from "../Supabase";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState({});
  const [actionLoadingId, setActionLoadingId] = useState(null); // للودينج المفضلة

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [productsData, categoriesData, sessionData] = await Promise.all([
          getProducts(),
          getCategories(),
          supabase.auth.getSession()
        ]);

        setProducts(productsData || []);
        setCategories(categoriesData || []);

        if (sessionData.data.session?.user) {
          const wishlistItems = await getWishlist();
          const favsMap = {};
          wishlistItems.forEach((item) => {
            favsMap[item.product_id] = true;
          });
          setFavorites(favsMap);
        }
      } catch (err) {
        setError(
          "Failed to load products. Please check your database connection."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
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

  const filteredProducts = selectedCategory === "all"
    ? products
    : products.filter((product) => String(product.category_id) === String(selectedCategory));

  if (loading) {
    return (
      <div className="min-h-[450px] flex items-center justify-center px-4 py-16 bg-gray-100">
        <div className="flex flex-col items-center text-center">
          <div className="relative w-28 h-28 flex items-center justify-center mb-7">
            <div className="absolute inset-0 bg-[#8A1C38]/10 rounded-full blur-2xl animate-pulse" />
            <div className="absolute inset-0 rounded-full border-[3px] border-gray-200" />
            <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#8A1C38] border-r-[#8A1C38] animate-spin" />
            <div className="w-[76px] h-[76px] rounded-full bg-white shadow-lg flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-9 h-9 text-[#8A1C38]"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </div>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight mb-2">
            Loading Your Products
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            We're getting everything ready for you.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#8A1C38] animate-bounce [animation-delay:0ms]" />
            <span className="w-2 h-2 rounded-full bg-[#8A1C38] animate-bounce [animation-delay:150ms]" />
            <span className="w-2 h-2 rounded-full bg-[#8A1C38] animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center px-4 py-16">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="w-8 h-8 text-red-500"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4m0 4h.01" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Something Went Wrong
        </h2>
        <p className="text-red-500 text-sm max-w-md">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className=" mx-auto px-4 py-[120px] bg-gray-100 min-h-screen">
      <h1 className="text-[40px] font-bold text-[#8A1C38] mb-10">
        Available Products
      </h1>

      <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-8 scrollbar-none">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap cursor-pointer shadow-sm ${
            selectedCategory === "all"
              ? "bg-[#8A1C38] text-white shadow-md shadow-[#8A1C38]/30"
              : "bg-white text-gray-700 hover:bg-gray-200"
          }`}
        >
          All
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap cursor-pointer shadow-sm ${
              String(selectedCategory) === String(cat.id)
                ? "bg-[#8A1C38] text-white shadow-md shadow-[#8A1C38]/30"
                : "bg-white text-gray-700 hover:bg-gray-200"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => {
            const discountPercent =
              product.price && product.discount_price
                ? Math.round(
                    ((product.price - product.discount_price) /
                      product.price) *
                      100
                  )
                : 0;

            const isFavorite = favorites[product.id] || false;
            const isThisProductLoading = actionLoadingId === product.id;

            return (
              <div
                key={product.id}
                className="bg-white border rounded-2xl p-4 shadow-sm flex flex-col justify-between relative overflow-hidden"
              >
                {discountPercent > 0 && (
                  <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md z-10">
                    -{discountPercent}%
                  </span>
                )}

                <button
                  onClick={() => !isThisProductLoading && toggleFavorite(product.id)}
                  disabled={isThisProductLoading}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/85 hover:bg-white backdrop-blur-md shadow-md flex items-center justify-center z-10 transition-transform active:scale-90 cursor-pointer disabled:opacity-70"
                  aria-label="Add to favorites"
                >
                  {isThisProductLoading ? (
                    <Loader2 size={18} className="animate-spin text-[#8A1C38]" />
                  ) : (
                    <Heart
                      size={20}
                      className={`transition-colors duration-200 ${
                        isFavorite ? "text-red-500 fill-red-500" : "text-gray-400 hover:text-gray-600"
                      }`}
                    />
                  )}
                </button>

                <div className="flex h-full flex-col justify-around">
                  <div className="w-full flex items-center justify-center">
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-50 object-cover rounded-xl mb-3"
                      />
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-lg mb-1">
                      {product.name}
                    </h3>
                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  {product.discount_price ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[#8A1C38] font-bold text-lg">
                        ${product.discount_price}
                      </span>
                      <span className="text-sm text-gray-400 line-through">
                        ${product.price}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[#8A1C38] font-bold text-lg">
                      ${product.price}
                    </span>
                  )}

                  {/* Add to Cart يتحول لـ  -  1  +  لما المنتج يبقى في العربة */}
                  <CartControl productId={product.id} stock={product.stock} />
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-16 text-center text-gray-500">
            No products found in this category.
          </div>
        )}
      </div>
    </div>
  );
}