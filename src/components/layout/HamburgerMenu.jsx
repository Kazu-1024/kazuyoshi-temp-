import React, {useState} from 'react';

const HamburgerMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
  
    const toggleMenu = () => {
      setIsOpen(!isOpen);
    };
  
    return (
      <div className="relative">
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
          <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg">
            <ul className="flex flex-col">
              <li className="px-4 py-2 hover:bg-gray-100">
                <a href="#home">Home</a>
              </li>
              <li className="px-4 py-2 hover:bg-gray-100">
                <a href="#about">About</a>
              </li>
              <li className="px-4 py-2 hover:bg-gray-100">
                <a href="#services">Services</a>
              </li>
              <li className="px-4 py-2 hover:bg-gray-100">
                <a href="#contact">Contact</a>
              </li>
            </ul>
          </div>
        )}
      </div>
    )
  }

export default HamburgerMenu