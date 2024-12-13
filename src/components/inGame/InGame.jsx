import React, {useState,useEffect, useRef} from 'react'
import Choices from './Choices';
import defaultIcon from '../../assets/images/defaultIcon.png';
import Button from '../../assets/images/Button.png';
import heart from '../../assets/images/heart.png';
import correct from '../../assets/images/correct.png';
import incorrect from "../../assets/images/incorrect.png";
import { useLocation, useNavigate } from 'react-router-dom';

const InGame = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const roomId = location.state?.roomId;
  const existingWs = location.state?.ws; // WebSocket接続を受け取る
  const wsRef = useRef(null);
  const [playerId, setPlayerId] = useState(null);

  // クッキーからusernameを取得
  useEffect(() => {
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    };
    const username = getCookie('username');
    if (username) {
      setPlayerId(username);
    }
  }, []);

  // WebSocket接続の確立
  useEffect(() => {
    if (!roomId || !playerId) {
      console.log('roomIdまたはplayerIdが未設定:', { roomId, playerId });
      return;
    }

    // 既存のWebSocket接続があれば使用し、なければ新規作成
    if (existingWs) {
      console.log('既存のWebSocket接続を使用します');
      wsRef.current = existingWs;
    } else {
      console.log('新規WebSocket接続を作成します');
      const ws = new WebSocket('ws://localhost:8080/matchmaking');
      wsRef.current = ws;
      
      ws.onopen = () => {
        console.log('WebSocket接続が確立されました');
        ws.send(JSON.stringify({
          type: 'game_start',
          roomId: roomId,
          playerId: playerId
        }));
      };
    }

    // メッセージハンドラーの設定
    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('受信したメッセージの詳細:', data);

        if (data.status === 'game_start' && data.questions) {
          console.log('問題データを受信:', data.questions);
          // 問題データのフォーマットを修正
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
          } else {
            setIsPaused(true);
            setAnswerLocked(true);
          }
        } else if (data.status === 'answer_unlock') {
          console.log('answer_unlock case に入りました');
          setIsPaused(false);
          setAnswerLocked(false);
        }
      } catch (error) {
        console.error('WebSocketメッセージの処理中にエラー:', error);
      }
    };

    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [roomId, playerId, existingWs]);

  // 対戦中のスコアを管理する変数
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  // プレイヤーの残機
  const [hpA, setHpA] = useState(5);
  const [hpB, setHpB] = useState(5);

  const [timeLeft, setTimeLeft] = useState(100);  // 問題ごとの残り時間
  const [showChoices, setShowChoices] = useState(false);  // 問題選択肢の表示/非表示
  const [selectedChoice, setSelectedChoice] = useState(null); // 選択された解答を保持
  const [isPaused, setIsPaused] = useState(false);  // タイマーの停止/開始の制御
  const [answerPhase, setAnswerPhase] = useState(false);
  
  // テキストの表示、タイマーを管理するためのRef
  const displayTextTimerRef = React.useRef(null);
  const timerIntervalRef = React.useRef(null);

  // 問題文の表示用
  const [displayText, setDisplayText] = useState("");

  // サンプル問題データ
  const [sampleQuestion, setSampleQuestion] = useState([]);

  // 問題インデックスの管理
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);  // 現在の問題番号（インデックス）
  const [currentQuestion, setCurrentQuestion] = useState({
    id: 0,
    questionText: '',
    choices: [],
    correctAnswer: ''
  });  // 現在の問題

  // 問題の早押しボタンの無効化を管理
  const [answerLocked, setAnswerLocked] = useState(false);

  // 正解不正解の表示を管理
  const [showCorrectImage, setShowCorrectImage] = useState(false);
  const [showIncorrectImage, setShowIncorrectImage] = useState(false);

  //プレイヤ（自分とあいて）の状態を管理
  const [currentPhase, setCurrentPhase] = useState('idle');
  // 'idle' : どっちも未解答, 'playerA' : プレイヤーAが解答中, 'playerB' : プレイヤーBが解答中

  // 解答権を管理するstate
  const [answers, setAnswers] = useState({
    playerA: false,
    playerB: false,
  });

  const [gameEnded, setGameEnded] = useState(false);  // ゲーム終了状態のフラグ

   // 文字を一文字ず表示
   useEffect(() => {
    if (!isPaused && currentQuestion && currentQuestion.questionText) {
      displayTextTimerRef.current = setInterval(() => {
        setDisplayText((prev) => {
          const nextIndex = prev.length;
          if (nextIndex < currentQuestion.questionText.length) {
            return prev + currentQuestion.questionText[nextIndex];
          } else {
            clearInterval(displayTextTimerRef.current);
            return prev;
          }
        });
      }, 90);
    }
    
    return () => clearInterval(displayTextTimerRef.current);
  }, [isPaused, currentQuestion]);
  

  
  const intervalTime = 50; //プログレスバーの進む速さ
  // 問題のタイマー
  useEffect(() => {
    if (displayText === currentQuestion.questionText && !isPaused) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => (prevTime <= 0 ? 0 : prevTime - 1));
      }, intervalTime);
    } else {
      clearInterval(timerIntervalRef.current);  // isPausedがtrueの場合は停止
    }
  
    return () => clearInterval(timerIntervalRef.current);
  }, [displayText, currentQuestion.questionText, isPaused]);

  // 問題のタイマーを監視し0になったら次の問題へ移行
  useEffect(() => {
    if (timeLeft === 0) {
      nextQuestion();
    }
  }, [timeLeft]);

  const nextQuestion = () => {
    if (gameEnded) return;

    if (currentQuestionIndex + 1 < sampleQuestion.length) {
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setTimeLeft(100);
        setAnswerLocked(false);
        setIsPaused(false);
        setAnswers({playerA: false, playerB: false});
      }, 2000);
    } else {
      // 最の問題だった場合の処理
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
  

  // 早押しボタンがクリッ��されたときの処理
  const handlePlayerClick = () => {
    if (currentPhase === 'idle' && wsRef.current) {
      wsRef.current.send(JSON.stringify({
        type: 'answer_right',
        roomId: roomId,
        playerId: playerId
      }));
    }
  };


  // 解答選択時の処理を簡略化
  const handleChoiceSelect = (choice) => {
    setSelectedChoice(choice);
    setShowChoices(false);

    const isCorrect = choice === currentQuestion.correctAnswer;
    if (isCorrect) {
      setScoreA(scoreA + 1);
      handleCorrectClick();
    } else {
      setHpA(hpA - 1);
      handleIncorrectClick();
    }

    // 誤答の場合、answer_unlockを送信
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({
        type: 'answer_result',
        roomId: roomId,
        playerId: playerId,
        answer: choice,
        correct: isCorrect
      }));
    }

    setIsPaused(false);
    setAnswerLocked(false);
    
    // 問題文を高速表示して次の問題へ
    clearInterval(displayTextTimerRef.current);
    displayTextTimerRef.current = setInterval(() => {
      setDisplayText((prev) => {
        if (prev.length < currentQuestion.questionText.length) {
          return currentQuestion.questionText;
        } else {
          clearInterval(displayTextTimerRef.current);
          nextQuestion();
          return prev;
        }
      });
    }, 10);
  };

  // 解答権を管理して対戦状況の管理
  useEffect(() => {
    //　体力が0になったプレイヤーがいたら対戦を狩猟
    if (hpA == 0) {
      setTimeout(() => {
        handleGameEnd('playerB'); // プレイヤーBが勝利
      }, 2000);
    } else if (hpB == 0) {
      setTimeout(() => {
        handleGameEnd('playerA'); // プレイヤーAが勝利
      }, 2000);
    }
    // スコアが5に達したプレイヤーがいたら対戦を終了
    else if (scoreA == 5) {
      setTimeout(() => {
        handleGameEnd('playerA'); // プレイヤーAが勝利
      }, 2000);
    } else if (scoreB == 5) {
      setTimeout(() => {
        handleGameEnd('playerB'); // プレイヤーBが勝利
      }, 2000);
    // 両者が解答権を使用した場合
    } else if (answers.playerA && answers.playerB) {
      setTimeout(() => {
        clearInterval(displayTextTimerRef.current);

        displayTextTimerRef.current = setInterval(() => {
          setDisplayText((prev) => {
            const nextIndex = prev.length;
            if (nextIndex < currentQuestion.questionText.length) {
              return prev + currentQuestion.questionText[nextIndex];
            } else {
              // 完全に表示された場合の処理
              clearInterval(displayTextTimerRef.current); // タイマーをクリア
              nextQuestion(); // 次の問題に進む
              return prev;
            }
          });
        }, 10); // 高速表示の速度
      }, 2000);
    }
  }, [answers, hpA, hpB, scoreA, scoreB, currentQuestion.questionText]);

  // 解答の残り時間がなくなった場合
  const handleTimeOut = () => {
    setShowChoices(false); // 選択肢を非表示
    setIsPaused(false); // タイマー再開
    setAnswerPhase(false); // 解答フェーズを終了
  };

  // 問題のインデックスが更新されたら次の問題を設定
  useEffect(() => {
    if (currentQuestionIndex < sampleQuestion.length) {
      setCurrentQuestion(sampleQuestion[currentQuestionIndex]);
      setSelectedChoice(null); // 前回の選択肢をリセット
      setAnswerLocked(false); // 早押しボタン再度有効に
      setDisplayText(""); // 問題文のテキストをリセット
    }
  }, [currentQuestionIndex, sampleQuestion]);

  // 問題の正解不正解のアニメーション
  const handleCorrectClick = () => {
    setShowCorrectImage(true);
    
    const timer = setTimeout(() => {
      setShowCorrectImage(false);
    }, 1000);

    return () => clearTimeout(timer);
  };
  const handleIncorrectClick = () => {
    setShowIncorrectImage(true);
    
    const timer = setTimeout(() => {
      setShowIncorrectImage(false);
    }, 1000);

    return () => clearTimeout(timer);
  };

  const renderHpDots = (hp, isPlayerB = false) => {
    // HP表示用の配列を作成
    const hpArray = Array.from({ length: 5 });
  
    return hpArray.map((_, index) => {
      const displayOrder = isPlayerB ? hpArray.length - 1 - index : index; // Bは逆順でひじ
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

  const handleGameEnd = (winner) => {
    setGameEnded(true); // ゲーム終了フラグをセット

    if (displayText !== currentQuestion.questionText) {
      setTimeout(() => {
      displayTextTimerRef.current = setInterval(() => {
        setDisplayText((prev) => {
          const nextIndex = prev.length;
          if (nextIndex < currentQuestion.questionText.length) {
            return prev + currentQuestion.questionText[nextIndex];
          } else {
            // 完全に表示された場合の処理
            clearInterval(displayTextTimerRef.current); // タイマーをクリア
            navigate('/result');
            return prev;
          }
        });
      }, 10); // 高速表示の速度
    },2000)
    } else {
      setTimeout(() => {
        console.log(`${winner} wins the game!`);
      }, 2000);
    }
  }
  
  // 問題の状態をモニタリング
  useEffect(() => {
    console.log('現在の問題:', currentQuestion);
    console.log('全問題:', sampleQuestion);
  }, [currentQuestion, sampleQuestion]);

  return (
    <>
      <div className="relative flex flex-col h-full">
        {(showChoices || currentPhase === 'playerB') && (
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
              <p className="font-kdam text-4xl">Q{currentQuestionIndex + 1}</p>
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
              {currentQuestion.choices && currentQuestion.choices.map((choice, index) => (
                <div key={index} className="">
                  {index + 1}. {choice}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 早押しボタン、問題の選択肢、解説の表示エリア（早押しボタンが押された問題の選択の表示、問題が解れたら、解説の表示） */}
        <div className="flex flex-col flex-grow w-full relative items-center">
          {/* 選択肢の表示 */}
          {showChoices && (
            <div className="absolute flex top-5 items-center justify-center bg-gray-100 rounded-3xl shadow-lg w-10/12 h-56 mx-auto z-20">
              <Choices choices={currentQuestion.choices} onChoiceSelect={handleChoiceSelect}  onTimeOut={handleTimeOut}/>
            </div>
          )}
          {/* ボタンのスタイル */}
            <button type="button" className="mx-auto my-auto z-10" onClick={handlePlayerClick} disabled={answerLocked}>
              <img src={Button} draggable="false"/>
            </button>
        </div>
        {/* 対戦相手が解答中の時の表示 */}
        {currentPhase === 'playerB' && (
          <div className="absolute bottom-28 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-10 bg-gray-600 bg-opacity-50  text-white flex items-center justify-center z-30">
            <span className="text-lg font-bold">
              対戦相手が解答中...
            </span>
          </div>
        )}
        {/* 正誤判定結果の表示 */}
        {selectedChoice && (
          <>
            {showCorrectImage && (
              <div className="absolute mt-40 top-20 left-1/2 transform -translate-x-1/2 z-50 flex items-center justify-center pointer-events-none animate-fadeInOut">
                <img 
                  src={correct} 
                  alt="Correct" 
                  className="w-1/2 h-auto opacity-50" 
                />
              </div>
            )}
            {showIncorrectImage && (
              <div className="absolute mt-40 top-20 left-1/2 transform -translate-x-1/2 z-50 flex items-center justify-center pointer-events-none animate-fadeInOut">
                <img 
                  src={incorrect} 
                  alt="Incorrect" 
                  className="w-1/2 h-auto opacity-50" 
                />
              </div>
            )}

            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-10 bg-gray-600 bg-opacity-50  text-white flex items-center justify-center z-30">
              <span className="text-lg font-bold">
                {selectedChoice === currentQuestion.correctAnswer ? '正解！' : '不正解！'}
              </span>
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default InGame