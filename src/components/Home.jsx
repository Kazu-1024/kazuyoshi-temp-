import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import selectStyle from '../assets/images/style_select.png';
import startButton from '../assets/images/startButton.png';
import ranking from '../assets/images/ranking.png';
import Dropdown from './common/Dropdown';
import PlayerRating from './common/PlayerRating';
import Help from './common/Help'

const Home = () => {
  const navigate = useNavigate();
  const [isReadyToPlay, setIsReadyToPlay] = useState(false);
  
  // Cookieチェックを追加
  useEffect(() => {
    const cookies = document.cookie;
    if (!cookies) {
      navigate('/login');
    }
  }, [navigate]);

  const [rate, SetRate] = useState(1314);

  const [selectedOption, setSelectedOption] = useState("");  // 選択した項目
  
  // オプションが選ばれた時の処理
  const handleOptionSelect = (option) => {
    setSelectedOption(option.label);  // 選ばれた項目を設定
  };
  const rankingpage = () => {
    navigate('/rankings')
  }
  const handleImageClick = () => {
    // ダミー音声合成を実行
    var speechSynthesis = window.speechSynthesis;
    var utterance = new SpeechSynthesisUtterance('');
    utterance.volume = 0; // 音量を0に設定
    speechSynthesis.speak(utterance);

    // ダミー音声が再生されたことをコンソールに表示
    console.log("ダミー音声が再生されました (音量0)");

    setIsReadyToPlay(true); // 音声再生準備が完了したことを知らせる

    // Matchingに遷移
    navigate('/Matching');
  };

  return (
    <div className="relative flex flex-col h-full w-full">
      {/* レーティング部分 */}
      {/* <div className="absolute right-1 top-1">
        <img src={ratingBg} alt="Rating Background" className="block" />
        <p className="absolute inset-0 left-9 flex items-center text-black font-jaro tracking-wider text-xl outlined-bold">
          {rate}
        </p>
      </div> */}

      <PlayerRating position="home"/>

      {/* プルダウンコンポーネントを呼び出し */}
      <Dropdown selectedOption={selectedOption} setOptionSelect={handleOptionSelect} />

      {/* 画像とボタン */}
      <div className="relative flex flex-col items-center justify-center aspect-square w-9/12 max-h-96 mx-auto mt-5">
        <img src={selectStyle} role="presentation" draggable="false" className="w-full h-full object-contain" alt="Style Select" />
        <button className="absolute bottom-[8%] transform -translate-y-1/2 w-1/2 h-[20px] flex items-center justify-center aspect-[5/1]" onClick={handleImageClick}>
          <img src={startButton} role="presentation" draggable="false" alt="Start Button" className="object-cover" />
        </button>
      </div>

      {/* ヘルプボタン */}
      <Help />
      {/*ランキングボタン */}
      <div className="absolute bottom-[10%] right-2 mb-2">
        <button onClick={() => {
          rankingpage();
          console.log('ランキングボタンがクリックされました');
        }}>
          <img src={ranking} role="presentation" draggable="false" className="w-10 h-10" alt="Help" />
        </button>
      </div>

    </div>
  );
}

export default Home;
