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
import { data } from 'autoprefixer';
import { use } from 'react';

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
  const [playerId, setPlayerId] = useState(null);
  const [timer, setTimer] = useState(null);
  const { ws, messageData } = useWebSocket();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [ableAnswer, setAbleAnswer] = useState([]);
  const [gameEnded, setGameEnded] = useState(null);
  const [question, setQuestion] = useState({
    id: null,
    questionType: '',
    questionText: '',
    choices: [], // 初期値を空配列にする
    correctAnswer: ''
  });
  
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
  
      // 対戦相手の名前を設定
      if (data.opponent) {
        console.log('対戦相手の名前を受信:', data.opponent);
        if (data.opponent === playerId) {
          localStorage.setItem('enemyName', data.player1Id);
          localStorage.setItem('playerName', data.opponent);
        } else {
          localStorage.setItem('enemyName', data.opponent);
          localStorage.setItem('playerName', data.player1Id);
        }
        setAbleAnswer([{ opponent: true, player1Id: true }]);
      }
  
      console.log('問題データを受信:', data.questions);
      const formattedQuestions = data.questions.map(q => ({
        id: q.id,
        questionType: q.question_type || '',
        questionText: q.question_text || '',
        choices: q.choices || [],
        correctAnswer: q.correct_answer || ''
      }));
  
      setQuestions(formattedQuestions);
      if (formattedQuestions.length > 0) {
        setQuestion(formattedQuestions[currentQuestionIndex]); // 最初の問題を設定
      }
    }
  }, [messageData, playerId,currentQuestionIndex]);  // messageDataとplayerIdを依存配列に追加
  


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
          player_id: localStorage.getItem("playerName"),
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
      }else{
        console.log('未知のステータス:', data.status);
      }
      } catch (error) {
      console.error("受信したメッセージの解析エラー:", error);
    }
  };
  
  const handleAnswerGiven = (data) => {
    console.log('answer_given case に入りました');
    console.log(data);
    console.log(playerId);
    const answeredPlayerId = data.player_id;
    if (answeredPlayerId === localStorage.getItem("playerName")) {
      console.log("回答権を獲得しました選択しをクリックしてください");
      setShowChoices(true);
    } else {
      setIsAnswering(true);
    }
    setAbleAnswer([{ answeredPlayerId: false }]);
    setIsPaused(true);
    setIsLocked(true);
  };

  const handleAnswerUnlock = (data) => {
    const answeredPlayerId = data.player_id;
  
    if (answeredPlayerId !== playerId) {
      setHpB(prevHp => prevHp - 1);
      setIsLocked(false);
    } else {
      console.log('回答権を失います');
      setHpA(prevHp => prevHp - 1);
    }
    setIsPaused(false);
    setIsAnswering(false);
    console.log(ableAnswer);
    if (ableAnswer.every(item => item.opponent === false && item.player1Id === false)) {
      setIsFastDisplay(true);
    }
  };
  //正解したときの処理だけど今のchoiceだと通らない
  const handleAnswerCorrect = (data) => {
    const answeredPlayerId = data.player_id;
  
    if (answeredPlayerId !== playerId) {
      setScoreB(prevScore => {
        const newScore = prevScore + 1;
        localStorage.setItem('enemyScore', newScore.toString());
        return newScore;
      });
    } else {
      setScoreA(prevScore => {
        const newScore = prevScore + 1;
        localStorage.setItem('myScore', newScore.toString());
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
    console.log("選択肢:", choice);
    const isCorrect = choice === question.correctAnswer;
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

    if(currentQuestionIndex + 1 < questions.length){
      console.log(currentQuestionIndex);
      console.log(questions);
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      setIsFastDisplay(false);
      setIsLocked(false);
      setIsPaused(false);
      setAbleAnswer([{ opponent: true, player1Id: true }]);
    }else{
      //ゲームの終了判定はまだしてない
    setGameEnded(true);
      setTimeout(() => {
        navigate('/result', { 
          state: { 
            result: {
              winner: scoreA > scoreB ? 'playerA' : 'playerB',
              scoreA: scoreA,
              scoreB: scoreB
            }
          } 
        });
      }, 2000);
    }
  };
  

  const onQuestionTimeOut = () => {
    console.log('問題のタイムアウト');
    onNextQuestion();
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
          <TimerQuestionDisplay type={question.questionType} questionText={question.questionText} choices={question.choices} isPaused={isPaused} isFastDisplay={isFastDisplay} ws={ws} onQuestionTimeOut={onQuestionTimeOut} handleAnswerGiven={handleAnswerGiven}  handleAnswerUnlock={handleAnswerUnlock} handleAnswerCorrect={handleAnswerCorrect} isHost={isHost} />
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