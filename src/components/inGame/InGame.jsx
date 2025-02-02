import React, {useState , useEffect} from 'react'
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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [showChoices, setShowChoices] = useState(false);
  const [isFastDisplay, setIsFastDisplay] = useState(false);  // 問題に正解してたらtrueにしたら問題文の表示が早くなるy
  const [isAnswering, setIsAnswering] = useState(false); // 対戦相手が解答中だったらtrueにしてね
  const [isCorrect, setIsCorrect] = useState(null); // 解答が正解かどうか
  const [playerId, setPlayerId] = useState(null);
  const { ws, messageData } = useWebSocket();
  const [question, setQuestion] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    id: 0,
    questionText: '',
    choices: [],
    correctAnswer: ''
  });  // 現在の問題
  const location = useLocation();
  const navigate = useNavigate();
  const roomId = location.state?.roomId;


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

    ws.send(JSON.stringify({
      type: 'game_start',
      roomId: roomId,
      playerId: playerId
    }));
  }, []);

  // WebSocket接続の確立
  useEffect(() => {
    if (!roomId || !playerId) {
      console.log('roomIdまたはplayerIdが未設定:', { roomId, playerId });
      return;
    }
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    const reconnectInterval = 3000; // 3秒
        try {
          const data = JSON.parse(messageData.data);
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
              questionType: q.question_type || '',
              questionText: q.question_text || '',
              choices: q.choices || [],
              correctAnswer: q.correct_answer || ''
            }));
            
            question(formattedQuestions);
            if (formattedQuestions.length > 0) {
              setCurrentQuestion(formattedQuestions[0]);
            }
          } else if (data.status === 'answer_given') {
            console.log('answer_given case に入りました');
            const answeredPlayerId = data.playerId;
            if (answeredPlayerId === playerId) {
                console.log("回答権を獲得しました選択しをクリックしてください");
                setShowChoices(true);
            }
            setIsPaused(true);
            setIsLocked(true);
          } else if (data.status === 'answer_unlock') {
            const answeredPlayerId = data.playerId;
            
            if (answeredPlayerId !== playerId) {
              // 相手が不正解の場合
              setHpB(prevHp => prevHp - 1);
            }
            
            if (answeredPlayerId === playerId) {
              console.log('answer_unlock case に入りました,回答権を失います');
              setIsPaused(false);
            } else {
              console.log('answer_unlock case に入りました,回答権が復活します');
              setIsPaused(false);
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
            setIsPaused(false);
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


    return () => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.close();
      }
    };
  }, );



  const onQuestionTimeOut = () => {
    console.log('問題のタイムアウト');
  }
  const onAnswerTimeOut = () => {
    console.log('解答のタイムアウト');
    setShowChoices(false);
  };
  const onSelectChoice = (choice) => {
    console.log("選択肢:", choice);
    ws.send(JSON.stringify({
      type: 'try_answer',
      roomId: roomId,
      playerId: playerId
    }));
    setShowChoices(false);
  };
  const handleAnswerClick = () => {
    ws.send(JSON.stringify({
      type: 'try_answer',
      roomId: roomId,
      playerId: playerId
    }));
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
        <div className="h-[55%] relative">
          <TimerQuestionDisplay isPaused={isPaused} isFastDisplay={isFastDisplay}/>
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