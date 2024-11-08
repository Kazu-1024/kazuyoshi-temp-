import React, {useState} from 'react'

const InGame = () => {
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [timeLeft, setTimeLeft] = useState(50);
  const [showChoices, setShowChoices] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [choices, setChoices] = useState(['選択肢1', '選択肢2', '選択肢3', '選択肢4']);

  const handleFastBtn = () => {
    setShowChoices(true);
  }

  //サンプルのための変数
  const correctChoices = ['選択肢1']

  
  return (
    <>
      <div className="flex flex-col h-full">
        {/*　対戦者の情報を表示 */}
        <div className="flex w-full grid-cols-2 shadow-md min-h-36">
            {/* player A */}
            <div className="w-full">
              <image src="#" alt="player A Icon" className="w-12 h-12 rounded-full" />
              <h3 className="font-bold">Player A</h3>
              <p className="">{scoreA} 点</p>
            </div>
            {/* player B */}
            <div className="w-full bg-gray-100 text-right">
              <image src="#" alt="player B Icon" className="w-12 h-12 rounded-full" />
              <h3 className="font-bold">Player B</h3>
              <p className="">{scoreB} 点</p>
            </div>
        </div>

        {/* 問題のタイムバー */}
        <div className="w-full pt-4 px-4">
          <progress value={timeLeft} max="100" className="w-full h-4 bg-gray-300 rounded-full">{timeLeft}%</progress>
        </div>

        {/* 現在の問題数 */}
        <div className="w-full text-left pl-6">
          第 {currentQuestion} 問目
        </div>

        {/* 問題文のテキスト表示 */}
        <div id="showQuestions" className="w-full p-4 h-56 bg-gray-300">
          <p className="font-bold">問題文の表示が表示される</p>
        </div>

        {/* 早押しボタン、問題の選択肢、解説の表示エリア（早押しボタンが押されたら問題の選択肢の表示、問題が解かれたら、解説の表示） */}
        <div className="flex flex-col flex-grow w-full">
          {/* 選択肢の表示 */}
          {showChoices && (
            <div className="pt-10 grid grid-cols-2 gap-4">
              {choices.map((choice, index) => (
                <button
                  key={index}
                  className="border rounded-lg py-2 bg-white shadow-md hover:bg-gray-100 h-20"
                >
                  {choice}
                </button>
              ))}
            </div>
          )}
          {/* ボタンのスタイル */}
          {!showChoices && (
            <div className="flex h-full w-full items-end justify-center p-20">
              <div className="border-2 border-black rounded-3xl w-52 h-16 flex justify-center">
                <button type="button" className="text-red-500 w-full h-full" onClick={handleFastBtn}>早押しボタン</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default InGame