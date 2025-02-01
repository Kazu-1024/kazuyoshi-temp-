import React, {useState} from 'react'
import GameStatus from './GameStatus';
import TimerQuestionDisplay from './Question/TimerQuestionDisplay';
import icon from '../../assets/images/defaultIcon.png';
import AnswerButton from './AnswerButton';
import Choices from './Choices.jsx';

const InGame = () => {
<<<<<<< HEAD
  const location = useLocation();
  const navigate = useNavigate();
  const roomId = location.state?.roomId;
  const existingWs = location.state?.ws; // WebSocket接続を受け取る
  const wsRef = useRef(null);
  const [playerId, setPlayerId] = useState(null);

  // クッキーからusernameを取得してLocalStorageに保存するuseEffect
  useEffect(() => {
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    };
    
    const username = getCookie('username');
    if (username) {
      setPlayerId(username);
      // LocalStorageにユーザー名を保存
      localStorage.setItem('playerName', username);
    }
  }, []);

  // WebSocket接続の確立
  useEffect(() => {
    if (!roomId || !playerId) {
      console.log('roomIdまたはplayerIdが未設定:', { roomId, playerId });
      return;
    }

    let ws;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    const reconnectInterval = 3000; // 3秒

    const connect = () => {
      if (existingWs) {
        console.log('既存のWebSocket接続を使用します');
        ws = existingWs;
        wsRef.current = existingWs;
      } else {
        console.log('新規WebSocket接続を作成します');
        ws = new WebSocket('ws://localhost:8080/matchmaking');
        wsRef.current = ws;
      }

      ws.onopen = () => {
        console.log('WebSocket接続が確立されました');
        reconnectAttempts = 0; // 接続成功時にリセット
        ws.send(JSON.stringify({
          type: 'game_start',
          roomId: roomId,
          playerId: playerId
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('受信したメッセージの詳細:', data);

          if (data.status === 'game_start' && data.questions) {
            // 対戦相手の名前を設定
            if (data.opponent) {
              console.log('対戦相手の名前を受信:', data.opponent);
              // 自分がPlayer2の場合は、opponentがPlayer1の名前
              if (data.opponent === playerId) {
                localStorage.setItem('enemyName', data.player1Id);
              } else {
                localStorage.setItem('enemyName', data.opponent);
              }
            }
            
            console.log('問題データを受信:', data.questions);
            const formattedQuestions = data.questions.map(q => ({
              id: q.id,
              questionText: q.question_text || '',
              choices: q.choices || [],
              correctAnswer: q.correct_answer || ''
            }));
            
            setSampleQuestion(formattedQuestions);
            if (formattedQuestions.length > 0) {
              setCurrentQuestion(formattedQuestions[0]);
            }
          } else if (data.status === 'answer_given') {
            console.log('answer_given case に入りました');
            const answeredPlayerId = data.playerId;
            
            if (answeredPlayerId === playerId) {
              setIsPaused(true);
              setShowChoices(true);
              setAnswerLocked(true);
              setCurrentPhase('playerA');
            } else {
              setIsPaused(true);
              setAnswerLocked(true);
              setCurrentPhase('playerB');
            }
          } else if (data.status === 'answer_unlock') {
            const answeredPlayerId = data.playerId;
            
            if (answeredPlayerId !== playerId) {
              // 相手が不正解の場合
              setHpB(prevHp => prevHp - 1);
            }
            
            if (answeredPlayerId === playerId) {
              console.log('answer_lock case に入りました,回答権を失います');
              setCurrentPhase('idle');
              setIsPaused(false);
              setAnswerLocked(true);
            } else {
              console.log('answer_unlock case に入りました,回答権が復活します');
              setCurrentPhase('idle');
              setIsPaused(false);
              setAnswerLocked(false);
            }
          } else if (data.status === 'answer_correct') {
            console.log('answer_correct case に入りました');
            const answeredPlayerId = data.playerId;
            
            if (answeredPlayerId !== playerId) {
              // 相手が正解した場合
              setScoreB(prevScore => {
                const newScore = prevScore + 1;
                localStorage.setItem('enemyScore', newScore.toString());
                return newScore;
              });
            }
            console.log(data.playerId + 'が正解しました');
            setCurrentPhase('idle');
            setIsPaused(false);
            setAnswerLocked(true);
          }

          // 相手の解答結果を処理
          if (data.status === 'answer_result') {
            const answeredPlayerId = data.playerId;
            
            // 相手の解答の場合
            if (answeredPlayerId !== playerId) {
              if (data.correct) {
                // 相手が正解した場合
                setScoreB(prevScore => {
                  const newScore = prevScore + 1;
                  localStorage.setItem('enemyScore', newScore.toString());
                  return newScore;
                });
              } else {
                // 相手が不正解の場合
                setHpB(prevHp => {
                  const newHp = prevHp - 1;
                  localStorage.setItem('enemyHp', newHp.toString());
                  return newHp;
                });
              }
            }
          }

        } catch (error) {
          console.error('WebSocketメッセージの処理中にエラー:', error);
        }
      };


      ws.onerror = (error) => {
        console.error('WebSocketエラー:', error);
      };
    }

    connect();

    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [roomId, playerId, existingWs]);

  // 対戦中のスコアを管理する変数
=======
>>>>>>> 8a6b6bc0a189f3e04d4bd87bfb4f7c75a0d88999
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