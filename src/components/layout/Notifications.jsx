import React, { useState, useRef } from 'react';
import Bell from "../../assets/images/Bell.png";
import userIcon from "../../assets/images/userIcon.png";
import settingIcon from "../../assets/images/settingIcon.png";

const Notification = () => {
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
        className=" rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 py-auto ml-4"
      >
<img src={Bell} className='mt-1 size-8' alt="" />      </button>
      {/* メニュー */}
      {isOpen && (
        <div className="fixed inset-0  flex-col items-center justify-center z-20 pt-60 pl-11 bg-gray-500 bg-opacity-50">
          <div className='bg-gray-700 rounded-t-lg shadow-lg w-11/12 max-w-md pt-1 flex z-10'>
            <img src={Bell} alt="" className='mx-2 size-8' />
            <p className='mt-1 ml-5 text-white font-bold'>notify</p>
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
          <div className="bg-white rounded-b-lg shadow-lg w-11/12  h-96 max-w-md p-6" >
            <ul className="flex flex-col">
              <li className="pl-4 py-2 hover:bg-gray-100 flex">
                <img src={settingIcon} alt="" className='size-7' />
                <a href="#home" className='mt-1 ml-4 font-bold'>メニュー</a>
                <div class="flex items-center justify-center w-4 h-4 ml-auto mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 6l6 6-6 6" />
                  </svg>
                </div>
              </li>
              <li className='border-t border-black border-0'>
              </li>
              <li className="pl-4 py-2 hover:bg-gray-100 flex ">
                <img src={userIcon} alt="" className='size-7' />
                <a href="#about " className='ml-4 font-bold'>プロフィール</a>
                <div class="flex items-center justify-center w-4 h-4 ml-auto mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 6l6 6-6 6" />
                  </svg>
                </div>

              </li>
              <li className='border-t border-black border-0'>
              </li>
            </ul>
          </div>
        </div>

      )}
    </div>
  );
};

export default Notification;