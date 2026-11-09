import { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function Nav({ isOpen, setIsOpen }) {
  const location = useLocation();
  const drawerRef = useRef(null);
  
  const mynav = [
    { name: "Home", path: "/" },
    { name: "About", path: "/About" },
    { name: "Shop", path: "/Shop" },
  ];

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    function handleClickOutside(event) {
      if (drawerRef.current && !drawerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  // إغلاق القائمة عند تغيير المسار
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, setIsOpen]);

  return (
    <>
      {/* الروابط للشاشات الكبيرة (Desktop) */}
      <nav className="hidden md:block">
        <ul className="flex gap-6 text-[20px] font-medium">
          {mynav.map((el, indx) => {
            const isActive = location.pathname === el.path || (el.path === "" && location.pathname === "/");

            return (
              <li key={indx} className="relative">
                <NavLink
                  to={el.path}
                  className={`relative px-4 py-2 rounded-xl block transition-colors duration-300 ${
                    isActive ? "text-white font-bold" : "text-black hover:text-[#8A1C38]"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-0 bg-[#8A1C38] rounded-xl -z-10 shadow-sm"
                    />
                  )}
                  {el.name}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* القائمة الجانبية للموبايل (Mobile Drawer with Animation) */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs md:hidden flex justify-end">
            <motion.div
              ref={drawerRef}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-[75%] max-w-sm bg-white h-full shadow-2xl flex flex-col p-6 pt-20 relative"
            >
              {/* زر الإغلاق داخل القائمة */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 text-gray-700 hover:text-[#8A1C38] transition cursor-pointer"
              >
                <X size={22} />
              </button>

              <ul className="flex flex-col gap-4">
                {mynav.map((el, indx) => {
                  const isActive = location.pathname === el.path || (el.path === "" && location.pathname === "/");

                  return (
                    <li key={indx} className="relative">
                      <NavLink
                        to={el.path}
                        onClick={() => setIsOpen(false)}
                        className={`relative px-4 py-3 rounded-xl block text-lg font-medium transition-colors duration-300 ${
                          isActive ? "text-white bg-[#8A1C38] font-bold" : "text-black hover:text-[#8A1C38] bg-gray-50"
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="mobileActiveIndicator"
                            className="absolute inset-0 bg-[#8A1C38] rounded-xl -z-10 shadow-sm"
                          />
                        )}
                        {el.name}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}