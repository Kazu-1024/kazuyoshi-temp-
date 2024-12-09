import React, { useState, useRef } from 'react';
import hamburgerIcon from "../../assets/images/hamburgerIcon.png";

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
      {/* ハンバーガーボタン */}
      <button
        onClick={toggleMenu}
        className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 py-auto ml-4"
      >
        {/* ハンバーガーアイコン */}
        <div className="space-y-1">
          <span className="block w-6 h-0.5 bg-gray-700"></span>
          <span className="block w-6 h-0.5 bg-gray-700"></span>
          <span className="block w-6 h-0.5 bg-gray-700"></span>
        </div>
      </button>

      {/* メニュー */}
      {isOpen && (
        <div className="fixed inset-0 flex-col items-center justify-center z-50 mt-72 ml-11">
          <div className='bg-gray-700  shadow-lg w-11/12 max-w-md pt-1 flex'>
            <img src={hamburgerIcon} alt="" className='ml-2 mt-2 h-4 w-1/12'/>
            <p className='mt-1 ml-5 text-white '>MENU</p>
            <div className=" justify-end ml-auto">
              <button
                onClick={closeMenu}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-md p-6" >
            <ul className="flex flex-col">
              <li className="px-4 py-2 hover:bg-gray-100">
                <a href="#home">メニュー</a>
              </li>
              <li className="px-4 py-2 hover:bg-gray-100">
                <a href="#about">プロフィール</a>
              </li>
              <li className="px-4 py-2 hover:bg-gray-100">
                <a href="#services">設定</a>
              </li>
              <li className="px-4 py-2 hover:bg-gray-100">
                <a href="#contact">その他</a>
              </li>
              <li className="px-4 py-2 hover:bg-gray-100">
                <a href="#contact">ログアウト</a>
              </li>
            </ul>
          </div>
        </div>

      )}
    </div>
  );
};

export default HamburgerMenu;