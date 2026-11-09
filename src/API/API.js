import { supabase } from "../Supabase"; // تأكد من المسار الصحيح حسب مكان ملف الـ Supabase.js

// دالة تسجيل الدخول
export async function loginUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  return { data, error };
}

// دالة إنشاء حساب جديد
export async function registerUser(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
  });
  return { data, error };
}

export async function checkIsAdmin(email) {
  const { data, error } = await supabase
    .from("admins")
    .select("*")
    .eq("email", email)
    .single();
  return { adminData: data, error };
}

export async function getCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*");

  if (error) {
    console.error("Error fetching categories:", error.message);
    throw error;
  }
  return data;
}

export async function getProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error.message);
    throw error;
  }
  return data;
}

export async function getFeaturedProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_featured", true);

  if (error) throw error;
  return data;
}

export async function getDiscountedProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .not("discount_price", "is", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching discounted products:", error.message);
    throw error;
  }
  return data;
}

export async function getWishlist() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const { data, error } = await supabase
    .from("wishlist")
    .select("id, product_id, products(*)") 
    .eq("user_id", session.user.id);

  if (error) {
    console.error("Error fetching wishlist:", error.message);
    throw error;
  }
  return data;
}

export async function addToWishlist(productId) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("wishlist")
    .insert([{ user_id: session.user.id, product_id: productId }])
    .select();

  if (error) {
    console.error("Error adding to wishlist:", error.message);
    throw error;
  }
  return data;
}

export async function removeFromWishlist(productId) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("User not authenticated");

  const { error } = await supabase
    .from("wishlist")
    .delete()
    .eq("user_id", session.user.id)
    .eq("product_id", productId);

  if (error) {
    console.error("Error removing from wishlist:", error.message);
    throw error;
  }
  return true;
}

export async function getCart() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const { data, error } = await supabase
    .from("cart_items")
    .select("id, product_id, quantity, products(*)")
    .eq("user_id", session.user.id);

  if (error) {
    console.error("Error fetching cart:", error.message);
    throw error;
  }
  return data;
}

export async function addToCart(productId, quantity = 1) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("User not authenticated");

  const { data: existingItem, error: fetchError } = await supabase
    .from("cart_items")
    .select("*")
    .eq("user_id", session.user.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (fetchError) {
    console.error("Error checking cart item:", fetchError.message);
    throw fetchError;
  }

  if (existingItem) {
    const { data, error } = await supabase
      .from("cart_items")
      .update({ quantity: existingItem.quantity + quantity })
      .eq("id", existingItem.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from("cart_items")
      .insert([
        {
          user_id: session.user.id,
          product_id: productId,
          quantity: quantity,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export async function removeFromCart(productId) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("User not authenticated");

  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", session.user.id)
    .eq("product_id", productId);

  if (error) {
    console.error("Error removing from cart:", error.message);
    throw error;
  }
  return true;
}


// export async function createOrder(shippingData) {
//   const { data: { session } } = await supabase.auth.getSession();
//   if (!session) throw new Error("User not authenticated");

//   const userId = session.user.id;

//   const { data: cartItems, error: cartError } = await supabase
//     .from("cart_items")
//     .select("product_id, quantity, products(price, discount_price)")
//     .eq("user_id", userId);

//   if (cartError) throw cartError;
//   if (!cartItems || cartItems.length === 0) {
//     throw new Error("cart is empty");
//   }

//   const totalPrice = cartItems.reduce((acc, item) => {
//     const prodPrice = item.products.discount_price || item.products.price || 0;
//     return acc + prodPrice * item.quantity;
//   }, 0);

//   const { data: orderData, error: orderError } = await supabase
//     .from("orders")
//     .insert([
//       {
//         user_id: userId,
//         total_price: totalPrice, // أو total_amount حسب عمود جدولك
//         shipping_address: shippingData.address || null,
//         phone: shippingData.phone || null,
//         status: "pending",
//       },
//     ])
//     .select()
//     .single();

//   if (orderError) throw orderError;

//   const orderId = orderData.id;

//   const orderItemsData = cartItems.map((item) => ({
//     order_id: orderId,
//     product_id: item.product_id,
//     quantity: item.quantity,
//     price: item.products.discount_price || item.products.price,
//   }));

//   const { error: itemsError } = await supabase
//     .from("order_items")
//     .insert(orderItemsData);

//   if (itemsError) throw itemsError;

//   const { error: clearCartError } = await supabase
//     .from("cart_items")
//     .delete()
//     .eq("user_id", userId);

//   if (clearCartError) {
//     console.error("Error clearing cart after checkout:", clearCartError);
//   }

//   return orderData;
// }


export async function sendContactMessage({ name, email, message }) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { error } = await supabase.from("messages").insert({
    user_id: session?.user?.id ?? null,
    name,
    email,
    subject: "Contact form",
    message,
  });

  if (error) throw error;
}

// جلب بروفايل المستخدم
export async function getMyProfile() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("full_name, phone, address, created_at")
    .eq("id", session.user.id)
    .maybeSingle();
  if (error) throw error;

  return { ...data, id: session.user.id, email: session.user.email };
}

// تحديث بروفايل المستخدم
export async function updateMyProfile({ full_name, phone, address }) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Not signed in");

  const { data, error } = await supabase
    .from("profiles")
    .update({ full_name, phone, address })
    .eq("id", session.user.id)
    .select("id");
  if (error) throw error;
  if (!data?.length) throw new Error("Profile row not found");
}

// جلب طلبات المستخدم
export async function getMyOrders() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const { data, error } = await supabase
    .from("orders")
.select(`
  id,
  total_amount,
  status,
  created_at,
  shipping_address,
  phone,
  order_items (
    id,
    quantity,
    price_at_purchase,
    products (name, image_url)
  )
`)
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error.message);
    throw error;
  }
  return data || [];
}
// تسجيل الخروج
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}









export async function getCartQuantities() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return {};

  const { data, error } = await supabase
    .from("cart_items")
    .select("product_id, quantity")
    .eq("user_id", session.user.id);
  if (error) throw error;

  return Object.fromEntries((data || []).map((i) => [i.product_id, i.quantity]));
}

export async function setCartQuantity(productId, quantity) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Not signed in");
  const userId = session.user.id;

  if (quantity <= 0) {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", userId)
      .eq("product_id", productId);
    if (error) throw error;
    return 0;
  }

  const { error } = await supabase
    .from("cart_items")
    .upsert(
      { user_id: userId, product_id: productId, quantity },
      { onConflict: "user_id,product_id" }
    );
  if (error) throw error;
  return quantity;
}

// Cart rows with their products, for the checkout page
export async function getCheckoutItems() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return [];

  const { data, error } = await supabase
    .from("cart_items")
    .select("id, quantity, products(id, name, price, discount_price, image_url, stock)")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: true });
  if (error) throw error;

  return (data || []).filter((i) => i.products);
}

// Creates the order from the cart. Returns the new order id.
export async function checkout({ customer_name, phone, address }) {
  const { data, error } = await supabase.rpc("checkout_cart", {
    p_customer_name: customer_name,
    p_phone: phone,
    p_address: address,
  });
  if (error) throw error;
  return data;
}

// Profile functions used by the Profile page (skip them if you already added them)
// export async function getMyProfile() {
//   const {
//     data: { session },
//   } = await supabase.auth.getSession();
//   if (!session) return null;

//   const { data, error } = await supabase
//     .from("profiles")
//     .select("full_name, phone, address, created_at")
//     .eq("id", session.user.id)
//     .maybeSingle();
//   if (error) throw error;

//   return { ...data, id: session.user.id, email: session.user.email };
// }

// export async function updateMyProfile({ full_name, phone, address }) {
//   const {
//     data: { session },
//   } = await supabase.auth.getSession();
//   if (!session) throw new Error("Not signed in");

//   const { data, error } = await supabase
//     .from("profiles")
//     .update({ full_name, phone, address })
//     .eq("id", session.user.id)
//     .select("id");
//   if (error) throw error;
//   if (!data?.length) throw new Error("Profile row not found");
// }