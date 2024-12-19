import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import selectStyle from '../assets/images/style_select.png';
import startButton from '../assets/images/startButton.png';
import ratingBg from '../assets/images/ratingBg.png';
import HelpCircle from '../assets/images/HelpCircle.png';
import pulldownIcon from '../assets/images/pulldownIcon.png';

const Home = () => {
  const navigate = useNavigate();
  const [rate, SetRate] = useState(1314);


  const [isOpen, setIsOpen] = useState(false);  // プルダウンメニューの開閉状態
  const [selectedOption, setSelectedOption] = useState("");  // 選択した項目
  
  const options = [
    { value: 'eiken', label: '英検準一級' },
    { value: 'TOEIC', label: 'TOEIC' },
  ];


  // プルダウンの開閉状態を切り替える関数
  const toggleDropdown = () => {
    setIsOpen(prevState => !prevState);  // 現在の状態を反転
  };

  // オプションが選ばれた時の処理
  const handleOptionSelect = (option) => {
    setSelectedOption(option.label);  // 選ばれた項目を設定
    setIsOpen(false);  // プルダウンを閉じる
  };

  // プルダウンメニューの作成
  function createPulldownMenu({ icon, options, selectedOption, isOpen, toggleDropdown }) {
    return (
      <div className="w-full h-28 flex flex-col justify-center relative">
        <div
          className={`bg-white border-4 ${isOpen ? "border-gray-800" : "border-gray-600"} flex my-auto justify-center h-20 mx-24 rounded-xl shadow-xl cursor-pointer transition-all duration-300 ease-in-out`}
          onClick={toggleDropdown}  // 要素全体をクリックするとプルダウンが開く
        >
          {/* アイコン */}
          <div className="my-auto border-2 p-1 border-black rounded-lg ml-2">
            <img src={icon} alt="icon" className="w-8 h-6 my-auto mr-2" />
          </div>
          <div className="w-px bg-gray-400 h-12 mx-4 my-auto"></div>

          {/* プルダウン表示 */}
          <div className="w-full flex items-center justify-between text-2xl font-medium text-center rounded-md">
            <span>{selectedOption || "選択してください"}</span>  {/* 選択された項目が表示される */}
          </div>
        </div>

        {/* プルダウンメニューの選択肢表示（isOpenがtrueの場合に表示） */}
        {isOpen && (
          <div className={`absolute top-full left-0 w-56 bg-white border-2 ${isOpen ? "border-gray-800" : "border-gray-600"} rounded-xl shadow-xl z-10 ml-24 transition-all duration-300 ease-in-out`}>
            {options.map((option) => (
              <div
                key={option.value}
                className="p-3 text-lg hover:bg-gray-200 cursor-pointer text-center"
                onClick={() => handleOptionSelect(option)}  // 選択項目を設定
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-full w-full">
      {/* レーティング部分 */}
      <div className="absolute right-1 top-1">
        <img src={ratingBg} alt="Rating Background" className="block" />
        <p className="absolute inset-0 left-9 flex items-center text-black font-jaro tracking-wider text-xl outlined-bold">
          {rate}
        </p>
      </div>

      {/* プルダウンメニューを関数化して使用 */}
      {createPulldownMenu({
        icon: pulldownIcon,
        options: options,
        selectedOption: selectedOption,
        isOpen: isOpen,
        toggleDropdown: toggleDropdown,
      })}

      {/* 画像とボタン */}
      <div className="relative flex flex-col items-center">
        <img src={selectStyle} className="mx-auto w-11/12" alt="Style Select" />
        <button className="absolute bottom-5 w-1/2 h-16" onClick={() => navigate('/Matching')}>
          <img src={startButton} alt="Start Button" className="w-full h-full" />
        </button>
      </div>

      {/* ヘルプボタン */}
      <div className="absolute bottom-20 left-2 mb-2">
        <button onClick={() => {
          console.log('ヘルプボタンがクリックされました');
        }}>
          <img src={HelpCircle} className="w-10 h-10" alt="Help" />
        </button>
      </div>
    </div>
  );
}


export default Home;
