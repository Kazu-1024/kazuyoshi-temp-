import React, { useState, useRef } from 'react';
import hamburgerIcon from "../../assets/images/hamburgerIcon.png";
import userIcon from "../../assets/images/userIcon.png";
import settingIcon from "../../assets/images/settingIcon.png";

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleOutsideClick = (event) => {
    if (dialogRef.current && !dialogRef.current.contains(event.target)) {
      closeMenu();
    }
  };

  return (
    <div className="relative" onClickCapture={handleOutsideClick}>
      <button
        onClick={toggleMenu}
        className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 py-auto ml-4"
      >
        <div className="space-y-1">
          <span className="block w-6 h-0.5 bg-gray-700"></span>
          <span className="block w-6 h-0.5 bg-gray-700"></span>
          <span className="block w-6 h-0.5 bg-gray-700"></span>
        </div>
      </button>

      {isOpen && (
        <div className="fixed inset-0  flex-col items-center justify-center z-20 pt-[45%] pl-11 pr-4 bg-gray-500 bg-opacity-50">
          <div className='rounded-t-lg bg-gray-700  shadow-lg w-11/12 max-w-md pt-1 flex z-10'>
            <img src={hamburgerIcon} alt="" className='ml-2 mt-2 h-4 w-1/12' />
            <p className='mt-1 ml-5 text-white font-bold'>MENU</p>
            <div className=" justify-end ml-auto">
              <button
                onClick={closeMenu}
                className="ml-auto text-gray-400 hover:text-gray-300"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <ul>
                <li className="flex items-center p-2 hover:bg-gray-100 rounded-md cursor-pointer">
                  <img src={settingIcon} alt="" className='size-6' />
                  <a href="#settings" className='ml-4 font-bold'>設定</a>
                </li>
                <li className="border-t border-gray-200 my-2"></li>
                <li className="flex items-center p-2 hover:bg-gray-100 rounded-md cursor-pointer">
                  <img src={userIcon} alt="" className='size-6' />
                  <a href="#user" className='ml-4 font-bold'>ユーザー設定</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HamburgerMenu;
