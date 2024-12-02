import React, {useState,useEffect} from 'react'
import Choices from './Choices';
import defaultIcon from '../../assets/images/defaultIcon.png';
import Button from '../../assets/images/Button.png';
import heart from '../../assets/images/heart.png';

const InGame = () => {
  // 対戦中のスコアを管理する変数
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  // プレイヤーの残機
  const [hpA, setHpA] = useState(5);
  const [hpB, setHpB] = useState(5);

  const [timeLeft, setTimeLeft] = useState(100);  // 問題ごとの残り時間
  const [showChoices, setShowChoices] = useState(false);  // 問題選択肢の表示/非表示
  const [selectedChoice, setSelectedChoice] = useState(null); // 選択された解答を保持
  const [currentQuestion, setCurrentQuestion] = useState(1);  // 現在の問題番号
  const [isPaused, setIsPaused] = useState(false);  // タイマーの停止/開始の制御
  const [answerPhase, setAnswerPhase] = useState(false);
  
  // テキストの表示、タイマーを管理するためのRef
  const displayTextTimerRef = React.useRef(null);
  const timerIntervalRef = React.useRef(null);

  // 問題文の表示用
  const [displayText, setDisplayText] = useState("");

  // サンプル問題のデータ
  const sampleQuestion = {
    questionText:
    'Much of the aid was ferried across the Atlantic Ocean, and so-called Liberty ships provided the backbone of this effort. Thanks to technological improvements, crossing the often-rough Atlantic had generally become a less dangerous prospect for ships in the 1940s than it had been just a few decades earlier. In wartime, however, (       ). Liberty ships were slow, and German submarines patrolled Atlantic waters. Attacks were a constant worry, and some ships along with their crews were lost.',
    choices: [
    'a new threat appeared',
    'more ships were available',
    'ships only traveled at night',
    'crew had to be paid more',
    ],
    correctAnswer: 'a new threat appeared',
  };

  // 文字を一文字ずつ表示
  useEffect(() => {
    if (!isPaused) {
      displayTextTimerRef.current = setInterval(() => {
        setDisplayText((prev) => {
          const nextIndex = prev.length;
          if (nextIndex < sampleQuestion.questionText.length) {
            return prev + sampleQuestion.questionText[nextIndex];
          } else {
            clearInterval(displayTextTimerRef.current);
            return prev;
          }
        });
      }, 50);
    } else {
      clearInterval(displayTextTimerRef.current);  // isPausedがtrueの場合は停止
    }
    
    return () => clearInterval(displayTextTimerRef.current);
  }, [isPaused, sampleQuestion.questionText]);
  
  // タイマー
  useEffect(() => {
    if (!isPaused) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => (prevTime <= 0 ? 0 : prevTime - 1));
      }, 300);
    } else {
      clearInterval(timerIntervalRef.current);  // isPausedがtrueの場合は停止
    }
  
    return () => clearInterval(timerIntervalRef.current);
  }, [isPaused]);

  // 早押しボタンがクリックされたときの処理
  const handlePlayerClick = () => {
    setIsPaused(true);  // タイマーを停止
    clearInterval(displayTextTimerRef.current);  // テキスト表示タイマーを停止
    clearInterval(timerIntervalRef.current);  //対戦中のタイマーを停止
    setAnswerPhase(true); //解答フェーズに移行
;   setShowChoices(true); // 選択肢を表示
  }

  // 解答選択時の処理
  const handleChoiceSelect = (choice) => {
    setSelectedChoice(choice);  // 選択した解答をセット
    setShowChoices(false); // 選択肢を非表示

    // とりあえずプレイヤーAの加点処理
    // ここらへんはバックでやると思う
    const isCorrect = choice === sampleQuestion.correctAnswer;
    setScoreA(isCorrect ? scoreA + 1 : scoreA);
    setCurrentQuestion(isCorrect ? currentQuestion + 1 : currentQuestion);
    setIsPaused(false);
  };

  // 解答の残り時間がなくなった場合
  const handleTimeOut = () => {
    setShowChoices(false); // 選択肢を非表示
    setIsPaused(false); // タイマー再開
    setAnswerPhase(false); // 解答フェーズを終了
  };

  const renderHpDots = (hp, isPlayerB = false) => {
    // HP表示用の配列を作成
    const hpArray = Array.from({ length: 5 });
  
    return hpArray.map((_, index) => {
      const displayOrder = isPlayerB ? hpArray.length - 1 - index : index; // Bは逆順でひょじ
      return (
        <span
          key={index}
          className={`relative w-3 h-3 ${displayOrder < hp ? '' : ''}`}
        >
          {displayOrder < hp ? (
            <img src={heart} alt="heart" className="w-full h-full" />
          ) : (
            <div className="absolute inset-0 m-auto w-1 h-1 rounded-full bg-black" />
          )}
        </span>
      );
    });
  };
  

  const renderScoreDots = (score, isPlayerB = false) => {
    // スコア表示用の配列を作成
    const scoreArray = Array.from({ length: 5 });

    return scoreArray.map((_, index) => {
      const displayOrder = isPlayerB ? scoreArray.length - 1 - index : index; // Bは逆順で表示
      return (
        <span
          key={index}
          className={`relative w-3 h-3 ${displayOrder < score ? "" : ""}`}
        >
          {displayOrder < score ? (
            <div className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-black" />
          ) : (
            <div className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-gray-300" />
          )}
        </span>
      )
    })
  };

  
  return (
    <>
      <div className="relative flex flex-col h-full">
        {showChoices && (
          <div className="absolute inset-0 bg-gray-500 bg-opacity-50 z-20" />
        )}
        {/*　対戦者の情報を表示 */}
        <div className="flex w-full grid-cols-2 shadow-md h-32 bg-white z-10">
            {/* player A */}
            <div className="w-full flex items-center mt-7">
              <div className="flex items-center w-5/6 h-2/3 pl-2 ml-2">
                <img src={defaultIcon} alt="player A Icon" className="w-12 h-12 rounded-full mr-2 border-2 border-black" />
                <div className="flex flex-col">
                <div className="flex border-2 rounded-3xl border-black px-2 py-1">{renderHpDots(hpA)}</div>
                <div className="flex border-2 rounded-3xl border-black px-2 py-1 mt-2">{renderScoreDots(scoreA)}</div>
                </div>
              </div>
            </div>
            {/* player B */}
            <div className="w-full flex items-center justify-end mt-7">
              <div className="flex items-center w-5/6 h-2/3 pr-2 mr-2">
                {/* スコアとHPを右寄せ */}
                <div className="flex flex-col items-end ml-auto">
                  <div className="flex border-2 rounded-3xl border-black px-2 py-1">{renderHpDots(hpB, true)}</div> {/* BのHPは逆順 */}
                  <div className="flex border-2 rounded-3xl border-black px-2 py-1 mt-2">{renderScoreDots(scoreB, true)}</div>
                </div>
                {/* アイコンはそのまま右端 */}
                <img src={defaultIcon} alt="player B Icon" className="w-12 h-12 rounded-full ml-2 border-2 border-black" />
               </div>
            </div>

            {/* 現在の問題数 */}
            <div className="absolute right-0 left-0 mx-auto w-full text-center mt-2">
              <p className="font-kdam text-4xl">Q{currentQuestion}</p>
            </div>
        </div>

        {/* 問題のタイムバー */}
        <progress value={timeLeft} max="100" className="w-full h-4 z-10">{timeLeft}%</progress>

        {/* 問題文のテキスト表示 */}
        <div className="w-11/12 h-[48dvh] mt-10 mx-auto border-2 border-black bg-white z-20">
          <p className="font-iceland pl-2 text-white bg-gray-400 border-b-2 border-black">QUESTION</p>
          {/* 問題文表示エリア */}
          <div className="flex flex-col items-center justify-center">
            <div className="h-[35dvh] pt-1 px-3 text-[17px] overflow-y-scroll">
              {displayText}
            </div>
            {/* 中央線 */}
            <div className="relative w-full mb-4">
              <div className="absolute inset-x-4 border-t border-gray-300" />
            </div>
            {/* 解答の選択肢を表示 */}
            <div className="grid grid-cols-2 gap-4 text-[11px] font-inter font-bold">
              {sampleQuestion.choices.map((choice, index) => (
                <div key={index} className="">
                  {index + 1}. {choice}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 早押しボタン、問題の選択肢、解説の表示エリア（早押しボタンが押されたら問題の選択肢の表示、問題が解かれたら、解説の表示） */}
        <div className="flex flex-col flex-grow w-full relative items-center">
          {/* 選択肢の表示 */}
          {showChoices && (
            <div className="absolute flex top-5 items-center justify-center bg-gray-100 rounded-3xl shadow-lg w-10/12 h-56 mx-auto z-20">
              <Choices choices={sampleQuestion.choices} onChoiceSelect={handleChoiceSelect}  onTimeOut={handleTimeOut}/>
            </div>
          )}
          {/* ボタンのスタイル */}
            <button type="button" className="mx-auto my-auto z-10" onClick={handlePlayerClick} >
              <img src={Button} draggable="false"/>
            </button>
        </div>
        {/* 正誤判定結果の表示 */}
        {selectedChoice && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-10 bg-gray-600 bg-opacity-50  text-white flex items-center justify-center z-30">
            <span className="text-lg font-bold">
              {selectedChoice === sampleQuestion.correctAnswer ? '正解！' : '不正解！'}
            </span>
          </div>
        )}
      </div>
    </>
  )
}

export default InGame