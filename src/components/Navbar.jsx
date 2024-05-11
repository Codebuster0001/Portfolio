import React, { useState } from 'react';
import { navigation } from '../constants';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const menuItems = navigation.map((item) => (
    <a
      key={item.id}
      href={item.url}
      className="text-gray-300 rounded-full hover:bg-purple-900 transition duration-1000 ease-in-out hover:text-white block px-3 py-2 text-base font-medium"
    >
      {item.title}
    </a>
  ));

  return (
    <nav className="mt-6 relative z-10">
      <div className="max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 font-medium text-[28px]">
            <span className="text-white">Deepak Kushwaha</span>
          </div>
          <div className="hidden sm:block">
            <div className="flex space-x-4">{menuItems}</div>
          </div>
          <div className="-mr-2 flex sm:hidden relative z-20">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:bg-gray-700 focus:text-white"
            >
              <svg
                className={`${isOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
              <svg
                className={`${isOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div className={`${isOpen ? 'block' : 'hidden'} sm:hidden absolute top-16 left-0 w-full z-50`}>
        <div className="px-2 pt-2 pb-3 space-y-1">{menuItems}</div>
      </div>
    </nav>
  );
};

export default Navbar;
