import { Outlet } from "react-router-dom";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import ScrollToTop from "../ScrollToTop";


export default function Layout() {
  return (
    <>
    <ScrollToTop />
      <div className="">
        <div className="">
          <Header />
        </div>
        <main className=" ">
            <Outlet />
        </main>
        
        <Footer />
      </div>
    </>
  )
}
