import React, {useState} from 'react'
import Tag1on1 from '../../assets/images/1on1_tag.png';
import ResultText from '../../assets/images/ResultText.png'
import defaultIcon from '../../assets/images/defaultIcon.png';
import HomeRouteButton from '../../assets/images/homeRouteButton.png'

const Result = () => {
  // サンプルデータ
  const [resultData, setResultData] = useState({
    winner: {name: '織田信長', rate: 1314 },
    loser: {name: '山口琉哉', rate: 1298 }
  });

  return (
    <>
      <div className="relative flex flex-col h-full">
        {/* リザルト画面のheader部分 */}
        <div className="relative h-32 border-b-2 bg-white border-black shadow-md flex flex-col justify-center items-center">
          <div className="w-5/6 border-t border-2 border-gray-300 mt-2" />
          <p className="font-notoSansJp font-bold text-4xl my-3">英検準一級</p>
          <div className="w-5/6 border-t border-2 border-gray-300" />
          <img src={Tag1on1} className="absolute top-2 left-2" />
        </div>
        {/* リザルト画面のmain部分 */}
        <div className="flex flex-col items-center flex-grow">
          <img src={ResultText} className="mx-auto mt-14 mb-3" />
          <div className="flex items-center w-5/6">
            <div className="w-2 h-2 bg-black rounded-full" />
            <div className="flex-grow border-t border-2 border-black" />
            <div className="w-2 h-2 bg-black rounded-full" />
          </div>
          {/* 勝者と敗者の表示 */}
          <div className="flex flex-col justify-between h-[26dvh] mt-16">
            {/* 勝者セクション */}
            <div className="w-72 h-1/2 mx-auto flex flex-grow">
              <div className="flex flex-col bg-white w-72 h-20 rounded-lg relative">
                <div className="w-5/6 border-t border border-gray-300 mt-2 mx-auto" />
                <div className="flex items-center justify-between w-full h-full px-5 ">
                  <img src={defaultIcon} className="w-12 h-12 rounded-full" />
                  <p className="text-lg mr-2">{resultData.winner.name}</p>
                  <p className="text-sm">{resultData.winner.rate}</p>
                </div>
                <div className="w-5/6 border-t border border-gray-300 mb-2 mx-auto" />
                <p className="absolute top-0 left-16 w-10 text-center bg-white text-[10px] font-afacad tracking-wide">winner</p>
              </div>
            </div>
            {/* 敗者セクション */}
            <div className="w-64 h-1/2 mx-auto flex flex-grow">
              <div className="flex flex-col bg-white w-72 h-20 rounded-lg relative">
                <div className="w-11/12 border-t border border-gray-300 mt-2 mx-auto" />
                <div className="flex items-center justify-between w-full h-full px-5 ">
                  <img src={defaultIcon} className="w-12 h-12 rounded-full" />
                  <p className="text-lg mr-2">{resultData.loser.name}</p>
                  <p className="text-sm">{resultData.loser.rate}</p>
                </div>
                <div className="w-11/12 border-t border border-gray-300 mb-2 mx-auto" />
                <p className="absolute top-0 left-16 w-8 text-center bg-white text-[10px] font-afacad tracking-wide">loser</p>
              </div>
            </div>
          </div>
          {/* 共有リンクとボタンのセクション */}
          <div className="flex flex-col items-center w-full mt-auto">
            <div className="w-64 h-16 rounded-full bg-gray-400 mb-10">
              {/* 共有リンクの内容を追記 */}
            </div>
            <button className="mx-auto mb-16">
              <img src={HomeRouteButton} alt="Home" />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Result