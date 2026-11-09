import {  createHashRouter } from "react-router-dom";
import Layout from "../components/Layouts/Layout";
import About from "../pages/About";
import Profile from "../pages/Profile";
import Order from "../pages/Order";
import Regester from "../pages/Regester";
import Login from "../pages/Login";
import Cart from "../pages/Cart";
import Wishlist from "../pages/Wishlist";
import Shop from "../pages/Shop";
import Home from "../pages/Home";
import { GuestRoute, ProtectedRoute } from "../components/GuestRoute";
import Checkout from "../pages/Checkout";



const router = createHashRouter([
  {
    path: "/",
element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "Shop", element: <Shop /> },
      { path: "About", element: <About /> },
      {
        path: "Profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      
      {
        path: "cart",
        element: (
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        ),
      },
      {
        path: "Checkout",
        element: (
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        ),
      },
      {
        path: "Wishlist",
        element: (
          <ProtectedRoute>
            <Wishlist />
          </ProtectedRoute>
        ),
      },
      {
        path: "login",
        element: (
          <GuestRoute>
            <Login />
          </GuestRoute>
        ),
      },
      {
        path: "Regester",
        element: (
          <GuestRoute>
            <Regester />
          </GuestRoute>
        ),
      },
      {
        path: "Order",
        element: (
          <ProtectedRoute>
            <Order />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

export default router;
