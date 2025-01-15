import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import selectStyle from '../assets/images/style_select.png';
import startButton from '../assets/images/startButton.png';
import ratingBg from '../assets/images/ratingBg.png';
import HelpCircle from '../assets/images/HelpCircle.png';
import Dropdown from './common/Dropdown';

const Home = () => {
  const navigate = useNavigate();
  const [rate, SetRate] = useState(1314);
<<<<<<< HEAD


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
=======
  const [selectedOption, setSelectedOption] = useState("");  // 選択した項目
>>>>>>> bc8cc9431de8464897b02e9ca61c8dcc83a3e376

  // オプションが選ばれた時の処理
  const handleOptionSelect = (option) => {
    setSelectedOption(option.label);  // 選ばれた項目を設定
  };

  return (
    <div className="relative flex flex-col h-full w-full">
      {/* レーティング部分 */}
      <div className="absolute right-1 top-1">
        <img src={ratingBg} alt="Rating Background" className="block" />
        <p className="absolute inset-0 left-9 flex items-center text-black font-jaro tracking-wider text-xl outlined-bold">
          {rate}
        </p>
      </div>

      {/* プルダウンコンポーネントを呼び出し */}
      <Dropdown selectedOption={selectedOption} setOptionSelect={handleOptionSelect} />

      {/* 画像とボタン */}
      <div className="relative flex flex-col items-center justify-center h-auto w-11/12 mx-auto mt-10">
        <img src={selectStyle} className="object-cover" alt="Style Select" />
        <button className="absolute bottom-0 transform -translate-y-1/2 w-1/2 h-16 flex items-center justify-center" onClick={() => navigate('/Matching')}>
          <img src={startButton} alt="Start Button" className="object-cover" />
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
