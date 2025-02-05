import React, { useState } from 'react';
import Dropdown from './common/Dropdown';
import defaultIcon from '../assets/images/defaultIcon.png';
import ratingBg from "../assets/images/ratingBg.png";

const Rankings = () => {
  // ドロップダウンで選択されたオプションを管理するための状態
  const [selectedOption, setSelectedOption] = useState("");
  
  // ランキングのモックデータ（実際にはデータ取得処理に置き換える）
  const mockRankings = [
    { rank: 1, name: "Player1", rate: 1456 },
    { rank: 2, name: "Player2", rate: 1402 },
    { rank: 3, name: "Player3", rate: 1389 },
    { rank: 4, name: "Player4", rate: 1375 },
    { rank: 5, name: "Player5", rate: 1362 },
    { rank: 6, name: "Player6", rate: 1362 },
  ];

  // オプションが選ばれたときに呼び出される処理
  const handleOptionSelect = (option) => {
    setSelectedOption(option.label);  // 選択された項目を状態に保存
  };

  return (
    <div className="relative flex flex-col h-full">
      {/* ヘッダーセクション（必要に応じて追加） */}

      {/* ドロップダウンセクション */}
      <div className="px-4 mt-4">
        <Dropdown 
          selectedOption={selectedOption} 
          setOptionSelect={handleOptionSelect} 
        />
      </div>

      {/* ランキングリスト */}
      <div className="flex flex-col items-center mt-6 space-y-4 overflow-y-auto max-h-[60vh] px-4">
        {mockRankings.map((player) => (
          <div 
            key={player.rank} 
            className="w-full max-w-md bg-white rounded-full shadow-md border-black border-2"
          >
            <div className="flex items-center justify-between w-full m-[2%] px-5 ">
              {/* 順位 */}
              <div className="text-2xl font-bold text-gray-500 w-12 text-center">
                {player.rank}
              </div>

              {/* プレイヤー情報 */}
              <div className="flex items-center flex-grow">
                <img 
                  src={defaultIcon} 
                  className="w-12 h-12 rounded-full mr-4" 
                  alt="Player Icon" // アクセシビリティのためのalt属性
                />
                <p className="text-lg">{player.name}</p>
              </div>

              {/* レート表示 */}
              <div className="relative w-1/3">
                <img src={ratingBg} alt="Rating Background" className="block" />
                <p className="absolute inset-0 flex items-center justify-center text-white font-jaro tracking-wider text-xl outlined-bold">
                  {player.rate}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Rankings;
