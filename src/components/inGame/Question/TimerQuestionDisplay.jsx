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
            console.log("isstop",isPaused);
            
            // すべて表示されたらタイマー開始
            if (!startTime) {
              ws.send(JSON.stringify({
                type: 'settingTimer',
              }));
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

  // タイマー処理（問題文が全て表示されていないと動かない）
  useEffect(() => {
    console.log("isReady",isReady,"startTime",startTime);
    if (!isReady || !startTime) return;

    if (!isPaused) {
      const updateTimer = () => {
        const now = Date.now();
        const diff = (100 - Math.floor((now - startTime) / 100));
        // console.log(diff);
        if (diff <= 0 || isFastDisplay) {
          clearInterval(timerRef.current);
            setTimeLeft(100);        // 初期化のタイマー設定
            setIsReady(false);       // タイマーの準備状態をリセット
            setStartTime(undefined); // 開始時刻をリセット
            setDisplayText("");      // 問題文をリセット
            setIsTimerReady(false);  // タイマーの準備状態をリセット
            indexRef.current = 0;    // 現在の表示位置をリセット
            onQuestionTimeOut();     // 問題のタイムアウト処理を実行
        } else {
          setTimeLeft(diff);
          // console.log("残り時間更新");
        }
      };

      updateTimer();
      timerRef.current = setInterval(updateTimer, 100);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerReady, isPaused, startTime]);

   // WebSocket状態管理
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
          questionText={questionText}
          choices={choices}
          explanation={explanation}
          isPaused={isPaused}
          setIsReady={setIsReady}
          setStartTime={setStartTime}
          startTime={startTime}
          isTimerReady={isTimerReady}
          setIsTimerReady={setIsTimerReady}
          ws={ws}
          handleAnswerGiven={handleAnswerGiven}
          handleAnswerUnlock={handleAnswerUnlock}
          handleAnswerCorrect={handleAnswerCorrect}
          onGameEnd={onGameEnd}
        />;
      default:
        return <ShortQuestion displayText={displayText} choices={choices} />;
    }
  }
  
  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.data); // 受け取ったメッセージを解析
      console.log('受信したメッセージ:', data);
      if (!data.status) {
        console.error("メッセージにstatusが含まれていません", data);
        return;
      }
      console.log('受信したメッセージ:', data);
  
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if(data.status == "timer_start"){
          setIsReady(true);
          setStartTime(data.startTime);
        }else if(data.status == 'answer_given'){
          handleAnswerGiven(data);
        }else if(data.status == 'answer_unlock'){
          handleAnswerUnlock(data);
        }else if(data.status == 'answer_correct'){
          handleAnswerCorrect(data);
        }else if(data.status == 'game_end'){
          onGameEnd(data);
        }else{
        console.log('未知のステータス:', data.status);
        } 
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