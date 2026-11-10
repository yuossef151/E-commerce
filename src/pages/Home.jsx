import { useState } from "react";
import DiscountedProductsSection from "../components/Home/DiscountedProductsSection";
import FeaturedSlider from "../components/Home/FeaturedSlider";
import HomeProductsSection from "../components/Home/HomeProductsSection";

export default function Home() {
  const [loadedSections, setLoadedSections] = useState({
    featured: false,
    discounts: false,
    products: false,
  });

  const pageLoading =
    !loadedSections.featured || !loadedSections.discounts || !loadedSections.products;

  const handleSectionLoaded = (section) => {
    setLoadedSections((prev) => ({
      ...prev,
      [section]: true,
    }));
  };

  return (
    <div className="relative bg-[#e5e6e8] min-h-screen overflow-x-hidden">

      <div className={pageLoading ? "invisible pt-[90px] sm:pt-[100px]" : "visible pt-[90px] sm:pt-[100px]"}>

        <FeaturedSlider
          onLoaded={() => handleSectionLoaded("featured")}
        />

        <DiscountedProductsSection
          onLoaded={() => handleSectionLoaded("discounts")}
        />

        <HomeProductsSection
          onLoaded={() => handleSectionLoaded("products")}
        />
      </div>

      {pageLoading && (
        <div className="absolute inset-0 z-40 min-h-screen bg-[#f4f4f6] flex items-center justify-center px-4">

          <div className="flex flex-col items-center text-center">

            <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center mb-6 sm:mb-8">
              <div className="absolute inset-0 rounded-full bg-[#8A1C38]/10 blur-2xl animate-pulse" />

              <div className="absolute inset-0 rounded-full border-[3px] border-gray-200" />

              <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#8A1C38] border-r-[#8A1C38] animate-spin" />

              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white shadow-xl flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-10 h-10 sm:w-12 sm:h-12 text-[#8A1C38]"
                >
                  <path d="m3 10 9-7 9 7" />
                  <path d="M5 9v11h14V9" />
                  <path d="M9 20v-7h6v7" />
                </svg>
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
              Welcome to Our Store
            </h1>

            <p className="text-xs sm:text-sm text-gray-500 mb-6 sm:mb-8">
              Preparing your shopping experience...
            </p>

            <div className="w-48 sm:w-56 md:w-64 h-1.5 bg-gray-200 rounded-full overflow-hidden mb-4">
              <div className="h-full w-1/2 bg-[#8A1C38] rounded-full animate-[loadingProgress_1.5s_ease-in-out_infinite]" />
            </div>

            <style>
              {`
                @keyframes loadingProgress {
                  0% { transform: translateX(-100%); }
                  100% { transform: translateX(200%); }
                }
              `}
            </style>

            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-gray-400 flex-wrap justify-center">
              <span className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${loadedSections.featured ? "bg-green-500" : "bg-[#8A1C38] animate-pulse"}`} />
                Featured
              </span>

              <span className="mx-1 text-gray-300">|</span>

              <span className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${loadedSections.discounts ? "bg-green-500" : "bg-[#8A1C38] animate-pulse"}`} />
                Offers
              </span>

              <span className="mx-1 text-gray-300">|</span>

              <span className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${loadedSections.products ? "bg-green-500" : "bg-[#8A1C38] animate-pulse"}`} />
                Products
              </span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}