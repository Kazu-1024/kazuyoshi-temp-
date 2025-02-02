import React, { useState } from 'react';
import pullDownIcon from '../../assets/images/pulldownIcon.png';

const Dropdown = ({ selectedOption, setOptionSelect }) => {
    const [isOpen, setIsOpen] = useState(false);

    const options = [
        { value: 'eiken', label: '英検準一級' },
        { value: 'TOEIC', label: 'TOEIC' },
    ];

    const toggleDropdown = () => setIsOpen(!isOpen);    // プルダウンの開閉状態の切り替え

    return (
        <div className="w-full h-10 flex flex-col justify-center relative mt-10">
        <div
          className={`bg-white border-4 ${isOpen ? "border-gray-800" : "border-gray-600"} flex my-auto justify-center h-20 mx-24 rounded-xl shadow-xl cursor-pointer transition-all duration-300 ease-in-out`}
          onClick={toggleDropdown}  // 要素全体をクリックするとプルダウンが開く
        >
          {/* アイコン */}
          <div className="my-auto border-2 p-1 border-black rounded-lg ml-2">
            <img src={pullDownIcon} alt="icon" className="w-8 h-6 my-auto mr-2" />
          </div>
          <div className="w-px bg-gray-400 h-12 mx-4 my-auto"></div>

          {/* プルダウン表示 */}
          <div className="w-full flex items-center justify-between text-2xl font-medium text-center rounded-md">
            <span className="text-xl">{selectedOption || "モードを選択"}</span>  {/* 選択された項目が表示される */}
          </div>
        </div>

        {/* プルダウンメニューの選択肢表示（isOpenがtrueの場合に表示） */}
        {isOpen && (
          <div className={`absolute top-full left-0 w-[200px] bg-white border-2 ${isOpen ? "border-gray-800" : "border-gray-600"} rounded-xl shadow-xl z-10 ml-24 transition-all duration-300 ease-in-out`}>
            {options.map((option) => (
              <div
                key={option.value}
                className="p-3 text-lg hover:bg-gray-200 cursor-pointer text-center"
                onClick={() => {
                    setOptionSelect(option);
                    setIsOpen(false);
                }}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
    );
};

export default Dropdown;