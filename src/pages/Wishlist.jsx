import { useState, useEffect } from "react";
import { getWishlist, removeFromWishlist } from "../API/API";
import { Trash2, Loader2 } from "lucide-react";
import { notifyRemovedFromWishlist, notifyError } from "../utils/toastService";
import CartControl from "../components/Cart/Cartcontrol";

export default function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const loadWishlistData = async () => {
    try {
      setLoading(true);
      const data = await getWishlist();
      setWishlistItems(data || []);
    } catch (err) {
      console.error("Error loading wishlist:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlistData();
  }, []);

  const handleDelete = async (productId) => {
    try {
      setDeletingId(productId);
      await removeFromWishlist(productId);
      
      setWishlistItems((prev) => prev.filter((item) => item.product_id !== productId));
      
      notifyRemovedFromWishlist();

      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (err) {
      console.error("Error removing from wishlist:", err);
      notifyError();
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[450px] flex items-center justify-center">
        <Loader2 size={36} className="animate-spin text-[#8A1C38]" />
      </div>
    );
  }

  return (
    <div className=" px-4 sm:px-6 lg:px-10 py-24 sm:py-28 min-h-screen bg-gray-100">
      <h1 className="text-2xl sm:text-3xl lg:text-[36px] font-bold text-[#8A1C38] mb-6 sm:mb-8 flex items-center gap-3">
        My Wishlist
      </h1>

      {wishlistItems.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 sm:p-12 text-center shadow-sm">
          <p className="text-gray-500 text-base sm:text-lg mb-4">Your wishlist is currently empty.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
          
          {/* عرض الجدول للشاشات المتوسطة والكبيرة (md فما فوق) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-700 text-sm">
                  <th className="py-4 px-6 font-bold">Product</th>
                  <th className="py-4 px-6 font-bold">Name</th>
                  <th className="py-4 px-6 font-bold">Price</th>
                  <th className="py-4 px-6 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {wishlistItems.map((item) => {
                  const product = item.products || item; 
                  const isDeleting = deletingId === product.id;

                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition">
                      {/* صورة المنتج */}
                      <td className="py-4 px-6">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-xl border border-gray-200"
                        />
                      </td>

                      {/* اسم المنتج */}
                      <td className="py-4 px-6 max-w-xs">
                        <h3 className="font-bold text-gray-900 truncate">{product.name}</h3>
                        <p className="text-xs text-gray-500 line-clamp-1">{product.description}</p>
                      </td>

                      {/* السعر */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="text-[#8A1C38] font-bold">
                            ${product.discount_price || product.price}
                          </span>
                          {product.discount_price && (
                            <span className="text-xs text-gray-400 line-through">
                              ${product.price}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* الأزرار */}
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-3">
                          <CartControl productId={product.id} stock={product.stock} />

                          <button
                            onClick={() => !isDeleting && handleDelete(product.id)}
                            disabled={isDeleting}
                            className="w-10 h-10 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition cursor-pointer disabled:opacity-50"
                            title="Remove from wishlist"
                          >
                            {isDeleting ? (
                              <Loader2 size={18} className="animate-spin text-red-600" />
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* عرض المنتجات كبطاقات (Cards) مرتبة وسلسة للهواتف المحمولة (أقل من md) */}
          <div className="md:hidden divide-y divide-gray-100">
            {wishlistItems.map((item) => {
              const product = item.products || item; 
              const isDeleting = deletingId === product.id;

              return (
                <div key={item.id} className="p-4 flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-xl border border-gray-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm truncate">{product.name}</h3>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{product.description}</p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[#8A1C38] font-bold text-sm">
                          ${product.discount_price || product.price}
                        </span>
                        {product.discount_price && (
                          <span className="text-xs text-gray-400 line-through">
                            ${product.price}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-50 gap-2">
                    <div className="flex-1">
                      <CartControl productId={product.id} stock={product.stock} />
                    </div>

                    <button
                      onClick={() => !isDeleting && handleDelete(product.id)}
                      disabled={isDeleting}
                      className="h-10 px-4 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 text-xs font-semibold"
                      title="Remove from wishlist"
                    >
                      {isDeleting ? (
                        <Loader2 size={16} className="animate-spin text-red-600" />
                      ) : (
                        <>
                          <Trash2 size={16} />
                          <span>Remove</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}
    </div>
  );
}