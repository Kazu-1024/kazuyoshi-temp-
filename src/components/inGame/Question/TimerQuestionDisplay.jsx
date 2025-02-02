import React, {useState, useEffect, useRef} from 'react'
import ShortQuestion from './ShortQuestion'
import { useWebSocket } from '../../../WebSocketContext';

const TimerQuestionDisplay = ({ type, questionText, choices, isPaused, isFastDisplay, ws, onQuestionTimeOut, isHost}) => {
  const [timeLeft, setTimeLeft] = useState(20);
  const [displayText, setDisplayText] = useState("");
  const [isTimerReady, setIsTimerReady] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [isReady, setIsReady] = useState(null);

  const displayTextTimerRef = useRef(null);
  const timerRef = useRef(null);
  const indexRef = useRef(0); // 現在の表示位置を保持

  // リスニングの時はこの文字の表示は動かさない

  // 文字を1文字ずつ表示（問題文の表示中はタイマーを動かさない）
  useEffect(() => {
    console.log(questionText,choices,type);
    if (!questionText || isTimerReady || type === "listening") return;
    
    if (!isPaused) {
      displayTextTimerRef.current = setInterval(() => {
        setDisplayText((prev) => {
          if (indexRef.current < questionText.length) {
            const newText = questionText.slice(0, indexRef.current + 1);
            indexRef.current += 1;
            return newText;
          } else {
            clearInterval(displayTextTimerRef.current);
            displayTextTimerRef.current = null;
            setIsTimerReady(true);
            console.log(isHost);
            // すべて表示されたらタイマー開始
            if (!startTime && isHost) {
              // ws.send(JSON.stringify({
              //   type: 'settingTimer',
              // }));
            }
            setIsReady(true);
            setStartTime(Date.now());
            ws.onmessage = (event) => {
              setIsReady(true);
              setStartTime(event.data.startTime);
              console.log(event.data.startTime);
            };

            ws.onclose = (event) => {
              console.log("Connection closed:", event);
            };
            
            ws.onerror = (event) => {
              console.log("Error occurred:", event);
            };
            return prev;
          }
        });
      }, isFastDisplay ? 50 : 200);
    }

    return () => {
      if (displayTextTimerRef.current) {
        clearInterval(displayTextTimerRef.current);
      }
    };
  }, [questionText, isPaused, isFastDisplay]);

  // タイマー処理（問題文が全て表示されていないと動かない）
  useEffect(() => {
    if (!isReady || !startTime) return;

    if (!isPaused) {
      const updateTimer = () => {
        const now = Date.now();
        console.log(startTime);
        const diff = 20 - Math.floor((now - startTime) / 1000);
        console.log(diff);
        if (diff <= 0) {
          setTimeLeft(0);
          setIsReady(false);
          setStartTime(null);
          setDisplayText(""); // 問題文のテキストをリセット
          setTimeLeft(20);
          onQuestionTimeOut();
          clearInterval(timerRef.current);
        } else {
          setTimeLeft(diff);
        }
      };

      updateTimer();
      timerRef.current = setInterval(updateTimer, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerReady, isPaused, startTime]);

  const renderQuestion = () => {
    switch (type) {
      // case "short":
      //   return <ShortQuestion displayText={displayText} choices={choices} />;
      // case "long":
      //   return <LongQuestion displayText={displayText} choices={choices} />;
      // case "listening":
      //   return <ListeningQuestion questionText={questionText} choices={choices} isPaused={isPaused} ws={ws} setIsTimerReady={setIsTimerReady}/>;
      // default:
      //   return <ShortQuestion displayText={displayText} choices={choices} />;
    }
  }

  return (
    
    <>
      <progress value={(timeLeft / 20) * 100} max="100" className="absolute top-0 left-0 w-full h-[3%] z-10 appearance-none"/>
      {/* {renderQuestion()} */}<ShortQuestion displayText={displayText} choices={choices} />;
    </>
  )
}

export default TimerQuestionDisplay