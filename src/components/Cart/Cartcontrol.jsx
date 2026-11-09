import { Loader2 } from "lucide-react";
// import { useCartQuantity } from "../context/CartQuantityContext";
import QuantityStepper from "./Quantitystepper";
import { useCartQuantity } from "./Cartquantitycontext";

// Drop-in replacement for the "Add to Cart" button on product cards:
// <CartControl productId={product.id} stock={product.stock} />
export default function CartControl({ productId, stock }) {
  const { quantities, busyId, setQuantity } = useCartQuantity();

  const quantity = quantities[productId] || 0;
  const busy = busyId === productId;

  // Never let the customer add more than what is in stock (or 99 if unknown)
  const max = stock > 0 ? Math.min(stock, 99) : 99;

  if (quantity === 0) {
    return (
      <button
        type="button"
        onClick={() => !busy && setQuantity(productId, 1)}
        disabled={busy}
        className="bg-[#8A1C38] text-white px-4 h-9 rounded-xl text-sm hover:bg-[#621428] transition cursor-pointer disabled:opacity-70 flex items-center justify-center min-w-[104px]"
      >
        {busy ? (
          <Loader2 size={16} className="animate-spin text-white" />
        ) : (
          "Add to Cart"
        )}
      </button>
    );
  }

  return (
    <QuantityStepper
      value={quantity}
      max={max}
      busy={busy}
      onChange={(next) => setQuantity(productId, next)}
    />
  );
}