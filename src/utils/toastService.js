// src/utils/toastService.js
import toast from "react-hot-toast";

// إشعار تسجيل الدخول
export const notifyLoginFirst = () => {
  toast.error("Please login first to add products to favorites!");
};

// إشعارات الـ Wishlist
export const notifyAddedToWishlist = () => {
  toast.success("Added to wishlist");
};

export const notifyRemovedFromWishlist = () => {
  toast.success("Removed from wishlist");
};

// إشعارات الـ Cart (العربة)
export const notifyAddToCart = () => {
  toast.success("Added to cart successfully!");
};

export const notifyRemovedFromCart = () => {
  toast.success("Removed from cart");
};

// إشعار خطأ عام
export const notifyError = () => {
  toast.error("Something went wrong!");
};