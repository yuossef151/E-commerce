// import { RouterProvider } from "react-router-dom";
import { RouterProvider } from "react-router-dom";
import router from "./routes/RouterApp";
import { Toaster } from "react-hot-toast";
import { CartQuantityProvider } from "./components/Cart/Cartquantitycontext";
 // عدل مسار الاستيراد حسب مكان الملف لديك

export default function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      

<CartQuantityProvider>
  <RouterProvider router={router} />
</CartQuantityProvider>
      
    </>
  );
}