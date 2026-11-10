import { useState, useEffect } from "react";
import { getCart, removeFromCart, setCartQuantity } from "../API/API";
import { Trash2, Loader2, ShoppingCart } from "lucide-react";
import { notifyRemovedFromCart, notifyError } from "../utils/toastService";
import { NavLink } from "react-router-dom";
import QuantityStepper from "../components/Cart/Quantitystepper";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const loadCartData = async () => {
    try {
      setLoading(true);
      const data = await getCart();
      setCartItems(data || []);
    } catch (err) {
      console.error("Error loading cart:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCartData();
  }, []);

  const handleDelete = async (productId) => {
    try {
      setDeletingId(productId);
      await removeFromCart(productId);

      setCartItems((prev) => prev.filter((item) => item.product_id !== productId));
      
      notifyRemovedFromCart();

      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error("Error removing from cart:", err);
      notifyError();
    } finally {
      setDeletingId(null);
    }
  };

  const handleQuantity = async (item, nextQty) => {
    if (nextQty < 1) return;
    const productId = item.product_id;

    try {
      setUpdatingId(productId);
      await setCartQuantity(productId, nextQty);

      setCartItems((prev) =>
        prev.map((i) =>
          i.product_id === productId ? { ...i, quantity: nextQty } : i
        )
      );

      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error("Error updating quantity:", err);
      notifyError();
    } finally {
      setUpdatingId(null);
    }
  };

  const totalPrice = cartItems.reduce((acc, item) => {
    const prod = item.products || item;
    const price = prod.discount_price || prod.price || 0;
    return acc + price * (item.quantity || 1);
  }, 0);

  const totalItems = cartItems.reduce((sum, i) => sum + (i.quantity || 1), 0);

  if (loading) {
    return (
      <div className="min-h-[450px] flex items-center justify-center">
        <Loader2 size={36} className="animate-spin text-[#8A1C38]" />
      </div>
    );
  }

  return (
    <div className=" px-4 sm:px-6 lg:px-10 py-24 sm:py-28 min-h-screen bg-[#e5e6e8]">
      <h1 className="text-2xl sm:text-3xl lg:text-[36px] font-bold text-[#8A1C38] mb-6 sm:mb-8 flex items-center gap-3">
        <ShoppingCart className="text-[#8A1C38]" size={28} /> Shopping Cart
      </h1>

      {cartItems.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 sm:p-12 text-center shadow-sm">
          <p className="text-gray-500 text-base sm:text-lg mb-4">Your cart is currently empty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
            
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-700 text-sm">
                    <th className="py-4 px-6 font-bold">Product</th>
                    <th className="py-4 px-6 font-bold">Name</th>
                    <th className="py-4 px-6 font-bold">Price</th>
                    <th className="py-4 px-6 font-bold">Qty</th>
                    <th className="py-4 px-6 font-bold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {cartItems.map((item) => {
                    const product = item.products || item;
                    const isDeleting = deletingId === product.id;

                    return (
                      <tr key={item.id} className="hover:bg-gray-50/50 transition">
                        <td className="py-4 px-6">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-xl border border-gray-200"
                          />
                        </td>
                        <td className="py-4 px-6 max-w-xs">
                          <h3 className="font-bold text-gray-900 truncate">{product.name}</h3>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-[#8A1C38] font-bold">
                            ${product.discount_price || product.price}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <QuantityStepper
                            tone="light"
                            allowRemove={false}
                            value={item.quantity || 1}
                            max={product.stock > 0 ? Math.min(product.stock, 99) : 99}
                            busy={updatingId === item.product_id}
                            onChange={(q) => handleQuantity(item, q)}
                          />
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => !isDeleting && handleDelete(product.id)}
                            disabled={isDeleting}
                            className="w-10 h-10 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center mx-auto transition cursor-pointer disabled:opacity-50"
                            title="Remove from cart"
                          >
                            {isDeleting ? (
                              <Loader2 size={18} className="animate-spin text-red-600" />
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-gray-100">
              {cartItems.map((item) => {
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
                        <div className="mt-1">
                          <span className="text-[#8A1C38] font-bold text-sm">
                            ${product.discount_price || product.price}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-50 gap-2">
                      <div>
                        <QuantityStepper
                          tone="light"
                          allowRemove={false}
                          value={item.quantity || 1}
                          max={product.stock > 0 ? Math.min(product.stock, 99) : 99}
                          busy={updatingId === item.product_id}
                          onChange={(q) => handleQuantity(item, q)}
                        />
                      </div>

                      <button
                        onClick={() => !isDeleting && handleDelete(product.id)}
                        disabled={isDeleting}
                        className="h-10 px-4 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 text-xs font-semibold"
                        title="Remove from cart"
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

          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 h-fit">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="flex justify-between mb-4 text-gray-600 text-sm sm:text-base">
              <span>Total Items:</span>
              <span className="font-bold text-gray-900">{totalItems}</span>
            </div>
            <div className="flex justify-between mb-6 text-base sm:text-lg font-bold text-gray-900 border-t pt-4">
              <span>Total Price:</span>
              <span className="text-[#8A1C38]">${totalPrice.toFixed(2)}</span>
            </div>
            <NavLink to="/Checkout" className="block">
              <button className="w-full bg-[#8A1C38] text-white py-3 rounded-xl font-semibold hover:bg-[#621428] transition cursor-pointer text-sm sm:text-base">
                Proceed to Checkout
              </button>
            </NavLink>
          </div>

        </div>
      )}
    </div>
  );
}