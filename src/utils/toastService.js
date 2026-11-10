import toast from "react-hot-toast";

const baseStyle = {
  borderRadius: "14px",
  padding: "12px 16px",
  fontSize: "14px",
  fontWeight: 600,
};

const successOptions = {
  style: {
    ...baseStyle,
    background: "#8A1C38",
    color: "#ffffff",
    boxShadow: "0 10px 30px rgba(138, 28, 56, 0.30)",
  },
  iconTheme: { primary: "#ffffff", secondary: "#8A1C38" },
};

const errorOptions = {
  style: {
    ...baseStyle,
    background: "#ffffff",
    color: "#621428",
    border: "1px solid #fca5a5",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.12)",
  },
  iconTheme: { primary: "#dc2626", secondary: "#ffffff" },
};

const success = (message) => toast.success(message, successOptions);
const error = (message) => toast.error(message, errorOptions);

export const notifyLoginFirst = () => {
  error("Please login first to continue.");
};

export const notifyAddedToWishlist = () => {
  success("Added to wishlist");
};

export const notifyRemovedFromWishlist = () => {
  success("Removed from wishlist");
};

export const notifyAddToCart = () => {
  success("Added to cart successfully!");
};

export const notifyRemovedFromCart = () => {
  success("Removed from cart");
};

export const notifyError = () => {
  error("Something went wrong!");
};

export const notifyLoginSuccess = () => {
  success("Logged in successfully!");
};

export const notifyLogoutSuccess = () => {
  success("Logged out successfully!");
};