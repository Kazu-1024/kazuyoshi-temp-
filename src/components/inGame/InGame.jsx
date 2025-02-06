import React, {useState , useEffect, useRef} from 'react'
import GameStatus from './GameStatus';
import TimerQuestionDisplay from './Question/TimerQuestionDisplay';
import icon from '../../assets/images/defaultIcon.png';
import AnswerButton from './AnswerButton';
import Choices from './Choices.jsx';
import Answering from './Answering.jsx';
import AnswerAnimation from './AnswerAnimation.jsx';
import { useWebSocket } from '../../WebSocketContext.js';
import { useLocation, useNavigate } from 'react-router-dom';
const InGame = () => {
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [hpA, setHpA] = useState(5);
  const [hpB, setHpB] = useState(5);
  const [isPaused, setIsPaused] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [showChoices, setShowChoices] = useState(false);
  const [isFastDisplay, setIsFastDisplay] = useState(false);  // 問題に正解してたらtrueにしたら問題文の表示が早くなるy
  const [isAnswering, setIsAnswering] = useState(false); // 対戦相手が解答中だったらtrueにしてね
  const [isCorrect, setIsCorrect] = useState(null); // 解答が正解かどうか
  const [timer, setTimer] = useState(null);
  const { ws, messageData } = useWebSocket();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [ableAnswer, setAbleAnswer] = useState([]);
  const [gameEnded, setGameEnded] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [opponentId, setOpponentId] = useState(null);
  const [isStarted, setIsStarted] = useState(null);
  const [question, setQuestion] = useState({
    id: null,
    questionType: '',
    questionText: '',
    choices: [], // 初期値を空配列にする
    correctAnswer: '',
    explanation: ''
  });
  const data = useRef();
  const playerIdRef = useRef(null);
  const oppnentIdRef = useRef(null);
  const ableAnswerRef = useRef([]);
  const currentQuestionIndexRef = useRef(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const roomId = location.state?.roomId;
  const isHost = location.state?.isHost;

  useEffect(() => {
    let data = messageData;
    console.log('受信したメッセージの詳細:', data);
    if (data.status === 'game_start' && data.questions) {
      // playerIdの設定を確認
      setPlayerId(data.player1Id);
      console.log('playerIdをセット:', data.player1Id);
  
      setUp(data);
    }
  }, []);

  useEffect(() => {
    playerIdRef.current = playerId;
    oppnentIdRef.current = opponentId;
  }, [playerId]);

  useEffect(() => {
    ableAnswerRef.current = ableAnswer;
    console.log("更新後の ableAnswer:", ableAnswerRef.current);
  },[ableAnswer]);

  useEffect(() => {
    currentQuestionIndexRef.current = currentQuestionIndex;  
  },[currentQuestionIndex])
  
  // WebSocket接続の確立
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

  useEffect(() => {
    //リロードされるとエラーが起きるので踏みとどまらせる処理(未完成)homeまで飛ばせばエラーが出ないはず
    const handleBeforeUnload = (event) => {
      if (ws && ws.readyState === WebSocket.OPEN && messageData) {
        // WebSocketで「surrender」メッセージを送信
        ws.send(JSON.stringify({
          room_id: messageData.room_id,
          type: 'surrender',
          player_id: playerId,
        }));
        console.log("マッチキャンセルのメッセージを送信しました");
      }
  
      const message = "ページを離れると降参されます。よろしいですか？";
  
      // ブラウザに対して確認メッセージを表示させる
      event.returnValue = message; //確認メッセージを表示
      return message; 
    };
  
    // beforeunloadイベントリスナーを登録
    window.addEventListener('beforeunload', handleBeforeUnload);
  
    // クリーンアップ時にリスナーを解除
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [ws, messageData]);
  
  
  const handleMessage = (event) => {
    try {
      
      const data = JSON.parse(event.data); // 受け取ったメッセージを解析
      console.log('受信したメッセージ:', data);
      if (!data.status) {
        console.error("メッセージにstatusが含まれていません", data);
        return;
      }
      console.log('受信したメッセージ:', data);
  
      if(data.status == 'answer_given') {
        console.log(data);
          handleAnswerGiven(data);
      }else if(data.status == 'answer_unlock'){
        handleAnswerUnlock(data);
      }else if(data.status == 'answer_correct'){
        handleAnswerCorrect(data);
      }else if(data.status == 'timer_start'){
        setTimer(20);
      }else if(data.status == 'game_end'){
        onGameEnd(data);
      }else{
        console.log('未知のステータス:', data.status);
      }
      } catch (error) {
      console.error("受信したメッセージの解析エラー:", error);
    }
  };
  
  const setUp = (data) => {
    // 対戦相手の名前を設定
    if (data.opponent) {
      console.log('対戦相手の名前を受信:', data.opponent);
      setPlayerId(data.player1Id);
      setOpponentId(data.opponent);
      setAbleAnswer([{ [data.opponent]: true, [data.player1Id]: true }]);
    }
    
    console.log('問題データを受信:', data.questions);
    const formattedQs = formattedQuestions(data.questions);
    
    setQuestions(formattedQs);
    
    if (formattedQs.length > 0) {
      setQuestion(formattedQs[0]);
    }
  };
  
  const formattedQuestions = (questions) => {
    return questions.map(q => ({
      id: q.id,
      questionType: q.question_type || '',
      questionText: q.question_text || '',
      choices: q.choices || [],
      correctAnswer: q.correct_answer || '',
      explanation: q.explanation || ''
    }));
  };
  

  const handleAnswerGiven = (data) => {
    console.log('answer_given case に入りました');
    console.log(data);
    console.log(playerIdRef.current);
    console.log(oppnentIdRef.current);
    const answeredPlayerId = data.player_id;
    if (answeredPlayerId === playerIdRef.current) {
      console.log("回答権を獲得しました選択しをクリックしてください");
      setShowChoices(true);
    } else {
      setIsAnswering(true);
    }
    setAbleAnswer(prev => {
      const prevObj = prev[0] || {};
      return [{ ...prevObj, [answeredPlayerId]: false }];
    });
    
    setIsPaused(true);
    setIsLocked(true);
  };

  
  const handleAnswerUnlock = (data) => {
    const answeredPlayerId = data.player_id;
  
    if (answeredPlayerId !== playerIdRef.current) {
      setHpB(prevHp => prevHp - 1);
    } else {
      console.log('回答権を失います');
      setHpA(prevHp => prevHp - 1);
    }
    setIsLocked(!ableAnswerRef.current[0][playerIdRef.current]);
    console.log(playerIdRef.current);
    console.log(!ableAnswerRef.current[0][playerIdRef.current]);
    setIsPaused(false);
    setIsAnswering(false);
    console.log(ableAnswerRef.current);
    const allFalse = Object.values(ableAnswerRef.current[0]).every(value => value === false);

    if (allFalse) {
      setIsFastDisplay(true);
    }

  };
  const handleAnswerCorrect = (data) => {
    const answeredPlayerId = data.player_id;
  
    if (answeredPlayerId !== playerIdRef.current) {
      setScoreB(prevScore => {
        const newScore = prevScore + 1;
        setIsAnswering(false);
        return newScore;
      });
    } else {
      setScoreA(prevScore => {
        const newScore = prevScore + 1;
        return newScore;
      });
    }
  
    console.log(`${data.player_id} が正解しました`);
    setIsPaused(false);
    setIsFastDisplay(true);
  };
  
  const onAnswerTimeOut = () => {
    console.log('解答のタイムアウト');
    ws.send(JSON.stringify({
      type: 'post_answer',
      roomId: roomId,
      playerId: playerId,
      answer: '時間切れ',
      correct: false,
    }));
    setShowChoices(false);
  };

  const onSelectChoice = (choice) => {
    console.log(question.correctAnswer);
    const myChoice = question.choices[choice - 1];
    console.log("選択肢:", myChoice);
    const isCorrect = myChoice === question.correctAnswer;
    ws.send(JSON.stringify({
      type: 'post_answer',
      roomId: roomId,
      playerId: playerId,
      answer: choice,
      correct: isCorrect
    }));
    setShowChoices(false);
  };

  const handleAnswerClick = () => {
    ws.send(JSON.stringify({
      type: 'try_answer',
      roomId: roomId,
      playerId: playerId
    }));
  };

  const onNextQuestion = () => {
    if (gameEnded) return;
  
    if (currentQuestionIndex + 1 < questions.length) {
      console.log("変更前", currentQuestionIndex);
      console.log("変更前", currentQuestionIndexRef.current);
  
      // Stateを更新しつつ、Refの値も手動で更新
      setCurrentQuestionIndex((prevIndex) => {
        const newIndex = prevIndex + 1;
        currentQuestionIndexRef.current = newIndex; // Refを明示的に更新
        return newIndex;
      });
  
      console.log("変更あと", currentQuestionIndexRef.current);
  
      // 次の質問をセット（setStateの非同期性を考慮）
      setTimeout(() => {
        setQuestion(questions[currentQuestionIndexRef.current]);
      }, 0);
  
      setIsFastDisplay(false);
      setIsLocked(false);
      setIsPaused(false);
  
      // opponentIdRef のスペルミス修正
      setAbleAnswer([{ [oppnentIdRef.current]: true, [playerIdRef.current]: true }]);
    } else {
      onGameEnd("lastQuestion");
    }
  };
  

  const onQuestionTimeOut = () => {
    console.log('問題のタイムアウト');
    onNextQuestion();
  };

  const onGameEnd = (data) => {
    //ゲームの終了判定はまだしてない
  setGameEnded(true);
  console.log(data);
  const reason = data.reason;
  console.log(data.reason);
  let result;
  if (reason === "hp_zero") {
    result = {  winner: data.winner, loser: data.loser};
  } else if (reason === "point_reached") {
    result = {  winner: data.winner, loser: data.loser};
  } else {
    // それ以外はスコアで勝者を決定
    result = { 
      winner: scoreA > scoreB ? playerId : opponentId,
      loser:  scoreA < scoreB ? playerId : opponentId,
     };
  }
  setTimeout(() => {
    navigate('/result', { 
      state: { result } 
    });
  }, 2000);
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
        <div className="h-[55%] relative">
          <TimerQuestionDisplay type={question.questionType} questionText={question.questionText} choices={question.choices} explanation={question.explanation} isPaused={isPaused} isFastDisplay={isFastDisplay} ws={ws} onQuestionTimeOut={onQuestionTimeOut} handleAnswerGiven={handleAnswerGiven}  handleAnswerUnlock={handleAnswerUnlock} handleAnswerCorrect={handleAnswerCorrect} onGameEnd={onGameEnd} isHost={isHost} setUp={setUp}/>
        </div>
        <div className="flex flex-col h-[31%] relative items-center justify-center">
          <AnswerButton isLocked={isLocked} onClick={handleAnswerClick}/>
          {showChoices && <Choices onAnswerTimeOut={onAnswerTimeOut} onSelectChoice={onSelectChoice} />}
        </div>
        <Answering showChoices={showChoices} isAnswering={isAnswering} />
        <AnswerAnimation isCorrect={isCorrect} />
    </div>
  )
}

export default InGame