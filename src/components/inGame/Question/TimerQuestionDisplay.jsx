import React, {useState, useEffect, useRef} from 'react'
import ShortQuestion from './ShortQuestion'
import LongQuestion from './LongQuestion'
import ListeningQuestion from './ListeningQuestion'

const TimerQuestionDisplay = ({ type, questionText, choices, explanation, isPaused, isFastDisplay, ws, onQuestionTimeOut, handleAnswerGiven, handleAnswerUnlock, handleAnswerCorrect, onGameEnd}) => {
  const [timeLeft, setTimeLeft] = useState(100);
  const [displayText, setDisplayText] = useState("");
  const [isTimerReady, setIsTimerReady] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [isReady, setIsReady] = useState(null);

  const displayTextTimerRef = useRef(null);
  const timerRef = useRef(null);
  const indexRef = useRef(0); // 現在の表示位置を保持
  //リスニングのために新規追加
  const listeningQuestionRef = useRef(null);
  const [isReading, setIsReading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // リスニングの時はこの文字の表示は動かさない

  // 文字を1文字ずつ表示（問題文の表示中はタイマーを動かさない）
   useEffect(() => {
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
            
            // タイマー開始
            if (!startTime) {
              ws.send(JSON.stringify({ type: 'settingTimer' }));
            }
            setIsReady(true);
            return prev;
          }
        });
      }, isFastDisplay ? 20 : 100);
    }

    return () => {
      if (displayTextTimerRef.current) {
        clearInterval(displayTextTimerRef.current);
      }
    };
  }, [questionText, isPaused, isFastDisplay]);

  //リスニングの処理
  useEffect(() => {
    if (!questionText || isTimerReady || type !== "listening") return;
    if (!isPaused) {
      setIsReading(true);
      setIsFinished(false);

      // 1秒後に再生
      setTimeout(() => {
          if (listeningQuestionRef.current) {
              listeningQuestionRef.current.play();
          }
      }, 1000);
    }
}, [questionText]);

const handleReadingEnd = () => {
    setIsReading(false);
    setIsFinished(true);
    setIsTimerReady(true);
    
    if (!startTime) {
        ws.send(JSON.stringify({ type: 'settingTimer' }));
    }
    setIsReady(true);
};

  useEffect(() => {
    if (!isReady || !startTime) return;
    if (!isPaused) {
      updateTimer();
      timerRef.current = setInterval(updateTimer, 100);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerReady, isPaused, startTime]);

  useEffect(() => {
    if (ws) {
      ws.onmessage = handleMessage;
    } 
    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [ws]);

  const renderQuestion = () => {
    switch (type) {
      case "short":
        return <ShortQuestion displayText={displayText} choices={choices} />;
      case "long":
        return <LongQuestion displayText={displayText} choices={choices} />;
      case "listening":
        return <ListeningQuestion 
          ref={listeningQuestionRef}
          questionText={questionText}
          choices={choices}
          explanation={explanation}
          onEnd={handleReadingEnd}
        />;
      default:
        return <ShortQuestion displayText={displayText} choices={choices} />;
    }
  }
  const updateTimer = () => {
    const now = Date.now();
    const diff = 100 - Math.floor((now - startTime) / 100);

    if (diff <= 0 || isFastDisplay ) {
      clearInterval(timerRef.current);
      setTimeLeft(100);
      setIsReady(false);
      setStartTime(undefined);
      setDisplayText("");
      setIsTimerReady(false);
      indexRef.current = 0;
      console.log("二回実行される");
      onQuestionTimeOut();
    } else {
      setTimeLeft(diff);
    }
  };
  
  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.data); // 受け取ったメッセージを解析
      if (!data.status) {
        console.error("メッセージにstatusが含まれていません", data);
        return;
      }
        if(data.status == "timer_start"){
          setIsReady(true);
          setStartTime(data.startTime);
        }else if(data.status == 'answer_given'){
          listeningQuestionRef.current?.pause()
          handleAnswerGiven(data);
        }else if(data.status == 'answer_unlock'){
          listeningQuestionRef.current?.resume()
          handleAnswerUnlock(data);
        }else if(data.status == 'answer_correct'){
          listeningQuestionRef.current?.resume()
          handleAnswerCorrect(data);
        }else if(data.status == 'game_end'){
          onGameEnd(data);
        }else{
        console.log('未知のステータス:', data.status);
        } 
    }catch (error) {
      console.error("受信したメッセージの解析エラー:", error);
    }
  };

  return (
    
    <>
      <progress value={timeLeft} max="100" className="absolute top-0 left-0 w-full h-[3%] z-10 appearance-none"/>
      {renderQuestion()}
    </>
  )
}

export default TimerQuestionDisplay