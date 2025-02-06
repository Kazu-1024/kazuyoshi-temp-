import React, { useState, useEffect } from 'react';
import Dropdown from './common/Dropdown';
import defaultIcon from '../assets/images/defaultIcon.png';
import ratingBg from "../assets/images/ratingBg.png";
import Bookmark_Gold from "../assets/images/Bookmark_Gold.png";
import Bookmark_Silver from "../assets/images/Bookmark_Silver.png";
import Bookmark_Brons from "../assets/images/Bookmark_Brons.png";
import Bookmark_normal from "../assets/images/Bookmark_normal.png";

const Rankings = () => {
  const [selectedOption, setSelectedOption] = useState("");
  const [rankings, setRankings] = useState([]);

  const fetchRankings = async () => {
    try {
      const response = await fetch("http://localhost:8080/rate/top");
      if (response.ok) {
        const data = await response.json();
        const dataArray = Object.values(data).map(item => ({
          name: item.username,
          rate: item.rating
        }));

        const sortedData = dataArray
          .sort((a, b) => b.rate - a.rate)
          .map((player, index) => ({
            ...player,
            rank: index + 1
          }));

        setRankings(sortedData);
      } else {
        console.error("ランキングデータの取得に失敗しました");
        setRankings([]);
      }
    } catch (error) {
      console.error("エラー:", error);
      setRankings([]);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, []);

  const handleOptionSelect = (option) => {
    setSelectedOption(option.label);
  };

  const getBookmarkImage = (rank) => {
    switch (rank) {
      case 1:
        return Bookmark_Gold;
      case 2:
        return Bookmark_Silver;
      case 3:
        return Bookmark_Brons;
      default:
        return Bookmark_normal;  // 4位以降はnormalブックマークを設定
    }
  };

  return (
    <div className="relative flex flex-col h-full">
      <div className="px-4 mt-4">
        <Dropdown
          selectedOption={selectedOption}
          setOptionSelect={handleOptionSelect}
        />
      </div>
      <div className='border mb-[20%] shadow-2xl'>
        <div className='mx-[4%] bg-[#313131] text-white rounded-t-lg pl-[8%] h-[8%] flex items-center'>
          TOP50
        </div>
        <div className='bg-white px-[2%] mx-[4%]'>
          <div className="flex flex-col items-center overflow-y-auto max-h-[60dvh] px-4 mb-[5%]">
            {rankings.length > 0 ? (
              rankings.map((player) => (
                <div
                  key={player.rank}
                  className="w-full max-w-md bg-white border-b border-gray-500"
                >
                  <div className="flex items-center w-full py-2 relative">
                    {/* 順位（左端） */}
                    <div className="text-2xl font-bold text-white w-12 text-center mx-auto z-10 outlined-bold">
                      {player.rank}
                    </div>

                    {/* ブックマーク画像（順位1,2,3のみ） */}
                    <div className="absolute w-12 h-12 text-center mt-2 ">
                      <img
                        src={getBookmarkImage(player.rank)}
                        alt={`Bookmark Rank ${player.rank}`}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* プレイヤー情報（中央） */}
                    <div className="flex items-center flex-1 px-4">
                      <img
                        src={defaultIcon}
                        className="w-[70%] h-[80%] rounded-full mr-4"
                        alt="Player Icon"
                      />
                      <p className="text-lg">{player.name}</p>
                    </div>

                    {/* レーティング（右端） */}
                    <div className="flex justify-end w-32">
                      <div className="relative w-24">
                        <img
                          src={ratingBg}
                          alt="Rating Background"
                          className="w-full"
                        />
                        <p className="absolute inset-0 flex items-center justify-center text-white font-jaro tracking-wider text-xl outlined-bold ml-[30%]">
                          {player.rate}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center mt-4">ランキングデータを読み込み中...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rankings;
