import { RouterProvider } from "react-router-dom";
import router from "./routes/RouterApp";
import { Toaster } from "react-hot-toast";
import { CartQuantityProvider } from "./components/Cart/Cartquantitycontext";

export default function App() {
  return (
    <>
      <Toaster position="bottom-right" reverseOrder={false} />
      

<CartQuantityProvider>
  <RouterProvider router={router} />
</CartQuantityProvider>
      
    </>
  );
}