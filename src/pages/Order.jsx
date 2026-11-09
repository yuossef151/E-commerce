import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Loader2,
  ShoppingCart,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  AlertCircle,
} from "lucide-react";
import { getMyOrders } from "../API/API";

export default function Order() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        const data = await getMyOrders();
        setOrders(data);
      } catch (err) {
        console.error("Failed to load orders:", err);
        setError("Could not load your orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  // دالة لتنسيق شكل ولون حالة الطلب (Status Badge) تم دعم Completed و Delivered معاً
  const getStatusBadge = (status) => {
    const cleanStatus = status?.toLowerCase().trim();
    
    switch (cleanStatus) {
      case "completed":
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
            <CheckCircle2 size={14} /> Completed 
          </span>
        );
      case "shipping":
      case "on the way":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200">
            <Truck size={14} /> On the way 
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200">
            <XCircle size={14} /> Cancelled 
          </span>
        );
      case "pending":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200">
            <Clock size={14} /> Pending 
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col pt-[100px] items-center justify-center gap-3 text-gray-500">
        <Loader2 className="animate-spin text-[#8A1C38]" size={38} />
        <p className="text-sm font-medium">Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 pb-16 pt-[100px] bg-gray-200">
        <div className="mx-auto flex max-w-md items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-10 pb-10 pt-[120px] min-h-screen bg-gray-100">
      <h1 className="text-3xl font-extrabold text-[#8A1C38] mb-10 flex items-center gap-3">
        <Package size={34} /> My Orders
      </h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 max-w-lg mx-auto">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#8A1C38]/10 text-[#8A1C38] mx-auto mb-4">
            <ShoppingCart size={28} />
          </span>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            No orders found
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            You haven't placed any orders yet. Start shopping now!
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center rounded-xl bg-[#8A1C38] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#621428]"
          >
            Explore Shop
          </Link>
        </div>
      ) : (
        <div className="space-y-6 max-w-4xl mx-auto">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition hover:shadow-md"
            >
              {/* رأس الطلب (معلومات أساسية) */}
              <div className="bg-gray-50/70 px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                    Order ID
                  </span>
                  <span className="text-sm font-mono font-bold text-gray-800">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                    Date & Time
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {new Date(order.created_at).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                    Total Amount
                  </span>
                  <span className="text-sm font-bold text-[#8A1C38]">
                    ${Number(order.total_amount || 0).toFixed(2)}
                  </span>
                </div>

                <div>{getStatusBadge(order.status)}</div>
              </div>

              {/* تفاصيل المنتجات داخل الطلب */}
              <div className="p-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
                  Order Items
                </h3>
                <div className="divide-y divide-gray-100">
                  {order.order_items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {item.products?.image_url ? (
                          <img
                            src={item.products.image_url}
                            alt={item.products?.name}
                            className="w-14 h-14 object-cover rounded-xl border border-gray-200 shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                            <Package size={20} className="text-gray-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="font-bold text-gray-900 text-sm truncate">
                            {item.products?.name || "Product"}
                          </h4>
                          <p className="text-xs text-gray-500">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-bold text-gray-900">
                          $
                          {(
                            Number(item.price_at_purchase) * item.quantity
                          ).toFixed(2)}
                        </span>
                        <p className="text-xs text-gray-400">
                          ${Number(item.price_at_purchase).toFixed(2)} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* معلومات الشحن الإضافية */}
                {(order.shipping_address || order.phone) && (
                  <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between gap-4 text-xs text-gray-500">
                    {order.shipping_address && (
                      <div>
                        <span className="font-semibold text-gray-700">
                          Shipping Address:{" "}
                        </span>
                        <span>{order.shipping_address}</span>
                      </div>
                    )}
                    {order.phone && (
                      <div>
                        <span className="font-semibold text-gray-700">
                          Phone:{" "}
                        </span>
                        <span>{order.phone}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}