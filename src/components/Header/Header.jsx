import { useState } from 'react';
import MyLogo from './MyLogo';
import Nav from './Nav';
import ProfileAndLogin from './ProfileAndLogin';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className='py-3 px-2 sm:px-4 md:px-6 flex items-center justify-between fixed top-0 z-50 bg-white w-full shadow-sm'>
        
        <div className="flex items-center">
          <MyLogo />
        </div>
        
        <div>
          <Nav isOpen={isOpen} setIsOpen={setIsOpen} /> 
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <ProfileAndLogin />
          
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-xl text-gray-700 hover:text-[#8A1C38] focus:outline-none transition cursor-pointer"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

      </div>
    </>
  );
}