import React, {useState} from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import Tag1on1 from '../../assets/images/1on1_tag.png';
import ResultText from '../../assets/images/ResultText.png'
import defaultIcon from '../../assets/images/defaultIcon.png';
import HomeRouteButton from '../../assets/images/homeRouteButton.png';
import ratingBg from "../../assets/images/ratingBg.png";
import shareImg from "../../assets/images/share.png";
import PlayerRating from '../common/PlayerRating';

const Result = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const result = location.state?.result;
  console.log(location.state);
  
  // LocalStorageから情報を取得
  const [resultData, setResultData] = useState(() => {
    
    // スコアを比較して勝者と敗者を決定
    const winner = result.winner; 
  
    const loser = result.loser;

    return { winner, loser };
  });

  return (
    <>
      <div className="relative flex flex-col h-full w-full">
        {/* リザルト画面のheader部分 */}
        <div className="relative h-[14%] border-b-2 bg-white border-black shadow-md flex flex-col justify-center items-center">
          <div className="w-5/6 border-t border-2 border-gray-300 mt-2" />
          <p className="font-notoSansJp font-bold text-4xl my-3">英検準一級</p>
          <div className="w-5/6 border-t border-2 border-gray-300" />
          <img src={Tag1on1} className="absolute top-2 left-2 w-[27%]" />
        </div>
        {/* リザルト画面のmain部分 */}
        <div className="flex flex-col items-center h-[86%]">
          <img src={ResultText} className="mx-auto mt-[5dvh] mb-3" />
          <div className="flex items-center w-5/6">
            <div className="w-2 h-2 bg-black rounded-full" />
            <div className="flex-grow border-t border-2 border-black" />
            <div className="w-2 h-2 bg-black rounded-full" />
          </div>
          {/* 勝者と敗者の表示 */}
          <div className="flex flex-col justify-between h-[50%] w-full">
            {/* 勝者セクション */}
            <div className="w-11/12 h-1/2 mx-auto flex flex-grow justify-center items-center">
                <div className="flex flex-col bg-white w-80 h-20 rounded-lg relative">
                    <div className="w-5/6 border-t border border-gray-300 mt-2 mx-auto" />
                    <div className="flex items-center justify-between w-full h-full px-5 ">
                        <img src={defaultIcon} className="w-12 h-12 rounded-full" />
                        <p className="text-lg mx-2">{result.winner}</p>
                        <PlayerRating username={result.winner} position="result" />
                    </div>
                    <div className="w-5/6 border-t border border-gray-300 mb-2 mx-auto" />
                    <p className="absolute top-0 left-16 w-10 text-center bg-white text-[12px] font-afacad tracking-wide">winner</p>
                </div>
            </div>
            {/* 敗者セクション */}
            <div className="w-10/12 h-1/2 mx-auto flex flex-grow justify-center">
                <div className="flex flex-col bg-white w-72 h-20 rounded-lg relative">
                    <div className="w-11/12 border-t border border-gray-300 mt-2 mx-auto" />
                    <div className="flex items-center justify-between w-full h-full px-5 ">
                        <img src={defaultIcon} className="w-12 h-12 rounded-full" />
                        <p className="text-[15px] mx-2">{result.loser}</p>
                        <PlayerRating username={result.loser} position="result" />
                    </div>
                    <div className="w-11/12 border-t border border-gray-300 mb-2 mx-auto" />
                    <p className="absolute top-0 left-16 w-8 text-center bg-white text-[12px] font-afacad tracking-wide">loser</p>
                </div>
            </div>
          </div>
          {/* 共有リンクとボタンのセクション */}
          <div className="flex flex-col items-center w-full h-[30%]">
            {/* 共有リンクをとりあえず画像で表示してる */}
            {/* <div className="w-64 h-16 rounded-full bg-gray-400 mb-10">
            </div> */}
            <div className="w-64 h-16 mb-10">
              <img src={shareImg} role="presentation" draggable="false" className="object-cover" />
            </div>
            <button className="mx-auto mb-16" onClick={() => navigate('/')}>
              <img src={HomeRouteButton} role="presentation" draggable="false" alt="Home" />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Result