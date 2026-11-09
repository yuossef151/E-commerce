import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "../../Supabase";
import { getCartQuantities, setCartQuantity } from "../../API/API";
import {
  notifyLoginFirst,
  notifyAddToCart,
  notifyRemovedFromCart,
  notifyError,
} from "../../utils/toastService";

// One shared copy of "how many of each product are in my cart", so every card
// on every page shows the same number without asking the database again and again.
const CartQuantityContext = createContext(null);

export function CartQuantityProvider({ children }) {
  const [quantities, setQuantities] = useState({}); // { [productId]: quantity }
  const [busyId, setBusyId] = useState(null); // product being saved right now

  const refresh = useCallback(async () => {
    try {
      setQuantities(await getCartQuantities());
    } catch (err) {
      console.error("Could not load cart quantities:", err);
    }
  }, []);

  useEffect(() => {
    refresh();

    // Sign in / sign out: reload (an empty cart when signed out).
    // setTimeout avoids calling Supabase inside its own auth callback.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      setTimeout(refresh, 0);
    });

    // Other pages (cart page, header) announce changes with this event
    window.addEventListener("cartUpdated", refresh);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("cartUpdated", refresh);
    };
  }, [refresh]);

  // quantity 0 removes the product from the cart
  const setQuantity = useCallback(
    async (productId, nextQty) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        notifyLoginFirst();
        return;
      }

      const before = quantities[productId] || 0;

      try {
        setBusyId(productId);
        await setCartQuantity(productId, nextQty);

        setQuantities((prev) => {
          const copy = { ...prev };
          if (nextQty <= 0) delete copy[productId];
          else copy[productId] = nextQty;
          return copy;
        });

        // Only toast when the product enters or leaves the cart (not on every + / -)
        if (before === 0 && nextQty > 0) notifyAddToCart();
        else if (nextQty <= 0) notifyRemovedFromCart();

        window.dispatchEvent(new Event("cartUpdated"));
      } catch (err) {
        console.error("Error updating cart quantity:", err);
        notifyError();
      } finally {
        setBusyId(null);
      }
    },
    [quantities],
  );

  const value = useMemo(
    () => ({ quantities, busyId, setQuantity, refresh }),
    [quantities, busyId, setQuantity, refresh],
  );

  return (
    <CartQuantityContext.Provider value={value}>
      {children}
    </CartQuantityContext.Provider>
  );
}

export function useCartQuantity() {
  const ctx = useContext(CartQuantityContext);
  if (!ctx) {
    throw new Error(
      "useCartQuantity must be used inside <CartQuantityProvider>",
    );
  }
  return ctx;
}
