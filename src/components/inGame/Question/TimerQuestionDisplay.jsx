import React, {useState, useEffect, useRef} from 'react'
import ShortQuestion from './ShortQuestion'

const TimerQuestionDisplay = ({ questionText, isPaused, isFastDisplay }) => {
  const [timeLeft, setTimeLeft] = useState(20);
  const [displayText, setDisplayText] = useState("");
  const [isQuestionFullyDisplayed, setIsQuestionFullyDisplayed] = useState(false);
  const [startTime, setStartTime] = useState(null);

  const displayTextTimerRef = useRef(null);
  const timerRef = useRef(null);
  const indexRef = useRef(0); // 現在の表示位置を保持

  // 文字を1文字ずつ表示（問題文の表示中はタイマーを動かさない）
  // useEffect(() => {
  //   if (!questionText || isQuestionFullyDisplayed) return;
    
  //   if (!isPaused) {
  //     displayTextTimerRef.current = setInterval(() => {
  //       setDisplayText((prev) => {
  //         if (indexRef.current < questionText.length) {
  //           const newText = questionText.slice(0, indexRef.current + 1);
  //           indexRef.current += 1;
  //           return newText;
  //         } else {
  //           clearInterval(displayTextTimerRef.current);
  //           displayTextTimerRef.current = null;
  //           setIsQuestionFullyDisplayed(true);

  //           // すべて表示されたらタイマー開始
  //           if (!startTime) {
  //             ws.emit("startTimer");
  //             setStartTime(Date.now());
  //           }
  //           return prev;
  //         }
  //       });
  //     }, isFastDisplay ? 50 : 200);
  //   }

  //   return () => {
  //     if (displayTextTimerRef.current) {
  //       clearInterval(displayTextTimerRef.current);
  //     }
  //   };
  // }, [questionText, isPaused, isFastDisplay]);

  // // タイマー処理（問題文が全て表示されていないと動かない）
  // useEffect(() => {
  //   if (!isQuestionFullyDisplayed || !startTime) return;

  //   if (!isPaused) {
  //     const updateTimer = () => {
  //       const now = Date.now();
  //       const diff = 20 - Math.floor((now - startTime) / 1000);
  //       if (diff <= 0) {
  //         setTimeLeft(0);
  //         onTimeOut();
  //         clearInterval(timerRef.current);
  //       } else {
  //         setTimeLeft(diff);
  //       }
  //     };

  //     updateTimer();
  //     timerRef.current = setInterval(updateTimer, 1000);
  //   }

  //   return () => {
  //     if (timerRef.current) {
  //       clearInterval(timerRef.current);
  //     }
  //   };
  // }, [isQuestionFullyDisplayed, isPaused, startTime]);


  return (
    <>
      <progress value={(timeLeft / 20) * 100} max="100" className="absolute top-0 left-0 w-full h-[3%] z-10 appearance-none"/>

      <div className="absolute w-11/12 h-[94%] bottom-0 left-1/2 transform -translate-x-1/2 border-2 border-black bg-white z-30 ">
        <p className="font-iceland pl-2 text-white bg-gray-400 border-b-2 border-black">QUESTION</p>
        <ShortQuestion displayText={displayText} choices={["Option 1", "Option 2", "Option 3", "Option 4"]}/>
      </div>
    </>
  )
}

export default TimerQuestionDisplay