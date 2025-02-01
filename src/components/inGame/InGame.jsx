import React, {useState} from 'react'
import GameStatus from './GameStatus';
import TimerQuestionDisplay from './Question/TimerQuestionDisplay';
import icon from '../../assets/images/defaultIcon.png';
import AnswerButton from './AnswerButton';
import Choices from './Choices.jsx';

const InGame = () => {
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [hpA, setHpA] = useState(5);
  const [hpB, setHpB] = useState(5);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [showChoices, setShowChoices] = useState(false);
  const [isFastDisplay, setIsFastDisplay] = useState(false);  // 問題に正解してたらtrueにしたら問題文の表示が早くなるy


  const onQuestionTimeOut = () => {
    console.log('問題のタイムアウト');
  }
  const onAnswerTimeOut = () => {
    console.log('解答のタイムアウト');
    setShowChoices(false);
  };
  const onSelectChoice = (choice) => {
    console.log("選択肢:", choice);
    setShowChoices(false);
  };
  const handleAnswerClick = () => {
    setIsLocked(true);
    setIsPaused(true);
    setShowChoices(true);
  };

  const onNextQuestion = () => {
    setCurrentQuestionIndex((prev) => prev + 1);
    setIsLocked(false);
    setIsPaused(false);
    setIsFastDisplay(false);
  };


  return (
    <div className="h-full w-full">
        <div className="relative flex w-full grid-cols-2 shadow-md h-[14%] bg-white z-10">
          <GameStatus iconSrc={icon} hp={hpA} score={scoreA} isPlayerB={false}/>
          <GameStatus iconSrc={icon} hp={hpB} score={scoreB} isPlayerB={true}/>
          <div className="absolute right-0 left-0 mx-auto w-full text-center mt-2 z-10">
            <p className="font-kdam text-4xl">Q{currentQuestionIndex + 1}</p>
          </div>
        </div>
        <div className="h-[55%] relative z-0">
          <TimerQuestionDisplay isPaused={isPaused} isFastDisplay={isFastDisplay}/>
        </div>
        <div className="flex flex-col h-[31%] relative items-center justify-center">
          <AnswerButton isLocked={isLocked} onClick={handleAnswerClick}/>
          {showChoices && <Choices onAnswerTimeOut={onAnswerTimeOut} onSelectChoice={onSelectChoice} />}
        </div>
    </div>
  )
}

export default InGame