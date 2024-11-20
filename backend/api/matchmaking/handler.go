package matchmaking

import (
	"database/sql"
	"fmt"
	"log"
	"math"
	"net/http"
	"sync"
	"sys3/api/rate"
	"time"

	"github.com/gorilla/websocket"
)

var (
	rooms      = make(map[string]*Room)
	roomsMutex sync.Mutex
	upgrader   = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true // 全てのオリジンを許可
		},
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}
	db *sql.DB
)

// WebSocketを使用したマッチメイキングハンドラー
func MatchmakingHandler(w http.ResponseWriter, r *http.Request) {

	// WebSocket接続のアップグレード
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Printf("WebSocketアップグレードエラー: %v\n", err)
		http.Error(w, fmt.Sprintf("WebSocketアップグレード失敗: %v", err), http.StatusInternalServerError)
		return
	}
	defer conn.Close()

	// Cookieの確認
	cookies := r.Cookies()
	fmt.Printf("受け取ったクッキー: %+v\n", cookies)

	cookie, err := r.Cookie("username")
	if err != nil {
		fmt.Printf("クッキーエラー: %v\n", err)
		conn.WriteJSON(map[string]string{
			"status":  "error",
			"message": "ログインが必要です",
		})
		return
	}

	fmt.Printf("見つかったユーザー名クッキー: %+v\n", cookie)

	fmt.Printf("WebSocket接続確立: %s\n", cookie.Value)

	roomsMutex.Lock()

	// 空いている部屋を探す
	var matchedRoom *Room
	for _, room := range rooms {
		if room.PlayerID != cookie.Value && !room.IsMatched {
			matchedRoom = room
			matchedRoom.IsMatched = true
			matchedRoom.Player2ID = cookie.Value
			break
		}
	}

	if matchedRoom != nil {
		// 既存の部屋とマッチングが成功した場合の処理
		roomsMutex.Unlock()

		// 両プレイヤーにマッチング成功を通知
		matchedRoom.Player2Conn = conn
		matchResponse := map[string]string{
			"status":  "matched",
			"room_id": matchedRoom.ID,
		}
		matchedRoom.Player1Conn.WriteJSON(matchResponse)
		conn.WriteJSON(matchResponse)

		// マッチング成功後、直接ゲームセッションを開始
		handleGameSession(matchedRoom, db)
		return
	}

	// マッチする部屋が見つからなかった場合、新しい部屋を作成
	newRoom := &Room{
		ID:          generateRoomID(),
		PlayerID:    cookie.Value,
		Player1Conn: conn,
		CreatedAt:   time.Now(),
		IsMatched:   false,
	}
	rooms[newRoom.ID] = newRoom
	roomsMutex.Unlock()

	// クライアントに待機状態を通知
	conn.WriteJSON(map[string]string{
		"status":  "waiting",
		"room_id": newRoom.ID,
	})

	// マッチングを待機
	if waitForMatch(newRoom) {
		handleGameSession(newRoom, db)
	}
	// マッチングがタイムアウトした場合は、この時点で処理が終了する
}

func generateRoomID() string {
	// ユニークな部屋IDを生成する実装
	return fmt.Sprintf("%d", time.Now().UnixNano())
}

func handleGameSession(room *Room, db *sql.DB) {
	// ゲーム開始メッセージを一度だけ送信
	startMessage := map[string]string{
		"status":  "game_start",
		"message": "対戦を開始します",
	}

	// エラーチェックを追加
	if err := room.Player1Conn.WriteJSON(startMessage); err != nil {
		log.Printf("Player1へのゲーム開始メッセージ送信エラー: %v", err)
		return
	}
	if err := room.Player2Conn.WriteJSON(startMessage); err != nil {
		log.Printf("Player2へのゲーム開始メッセージ送信エラー: %v", err)
		return
	}

	// 確実にメッセージが届くまで待機
	time.Sleep(1 * time.Second)

	// スコアを管理
	player1Score := 0
	player2Score := 0

	// 問題数を管理
	const TOTAL_QUESTIONS = 5
	for questionCount := 0; questionCount < TOTAL_QUESTIONS; questionCount++ {
		// 問題取得と送信を同期的に処理
		var question Question
		err := db.QueryRow(`
			SELECT id, question_text, correct_answer, choice1, choice2, choice3, choice4 
			FROM questions 
			ORDER BY RAND() 
			LIMIT 1
		`).Scan(
			&question.ID,
			&question.QuestionText,
			&question.CorrectAnswer,
			&question.Choices[0],
			&question.Choices[1],
			&question.Choices[2],
			&question.Choices[3],
		)
		if err != nil {
			log.Printf("問題取得エラー: %v", err)
			return
		}

		// 問題を送信
		questionMessage := map[string]interface{}{
			"status":   "question",
			"question": question,
		}

		// 両プレイヤーに順番に送信
		if err := room.Player1Conn.WriteJSON(questionMessage); err != nil {
			log.Printf("Player1への問題送信エラー: %v", err)
			return
		}
		if err := room.Player2Conn.WriteJSON(questionMessage); err != nil {
			log.Printf("Player2への問題送信エラー: %v", err)
			return
		}

		// 問題送信後、少し待機
		time.Sleep(1 * time.Second)

		// 回答権管理用のチャネル
		answerRights := make(chan string, 1)
		answerTimeout := time.After(10 * time.Second)
		var answered bool

		// 両プレイヤーからの回答リクエストを待機
		go handleAnswerRequest(room.Player1Conn, room.PlayerID, answerRights)
		go handleAnswerRequest(room.Player2Conn, room.Player2ID, answerRights)

		// 回答権または制限時間待ち
		select {
		case playerID := <-answerRights:
			// 回答権獲得を両プレイヤーに通知
			rightsGrantedMessage := map[string]interface{}{
				"status":    "answer_rights_granted",
				"message":   "回答権が獲得されました",
				"player_id": playerID, // どのプレイヤーが回答権を得たか
			}
			room.Player1Conn.WriteJSON(rightsGrantedMessage)
			room.Player2Conn.WriteJSON(rightsGrantedMessage)

			// 回答権を得たプレイヤーに通知
			answered = handlePlayerAnswer(room, playerID, question.CorrectAnswer)

			// スコアの更新
			if answered {
				if playerID == room.PlayerID {
					player1Score++
				} else {
					player2Score++
				}

				// スコア更新を両プレイヤーに通知
				scoreMessage := map[string]interface{}{
					"status":        "score_update",
					"player1_score": player1Score,
					"player2_score": player2Score,
				}
				room.Player1Conn.WriteJSON(scoreMessage)
				room.Player2Conn.WriteJSON(scoreMessage)
			}

		case <-answerTimeout:
			// 制限時間切れ
			timeoutMessage := map[string]string{
				"status":  "timeout",
				"message": "制限時間切れ",
			}
			room.Player1Conn.WriteJSON(timeoutMessage)
			room.Player2Conn.WriteJSON(timeoutMessage)
		}

		// 次の問題までの待機時間
		time.Sleep(3 * time.Second)
	}

	// 最終結果の通知
	finalResult := map[string]interface{}{
		"status": "game_end",
		"final_scores": map[string]interface{}{
			"player1": map[string]interface{}{
				"id":    room.PlayerID,
				"score": player1Score,
			},
			"player2": map[string]interface{}{
				"id":    room.Player2ID,
				"score": player2Score,
			},
		},
		"winner": determineWinner(room.PlayerID, room.Player2ID, player1Score, player2Score),
	}

	room.Player1Conn.WriteJSON(finalResult)
	room.Player2Conn.WriteJSON(finalResult)

	// レート計算と更新
	updatePlayerRatings(db, finalResult["winner"].(map[string]string)["id"],
		finalResult["winner"].(map[string]string)["loser_id"])
}

func handleAnswerRequest(conn *websocket.Conn, playerID string, answerRights chan<- string) {
	for {
		var message map[string]interface{}
		err := conn.ReadJSON(&message)
		if err != nil {
			log.Printf("メッセージ読み取りエラー: %v", err)
			return
		}

		log.Printf("受信したメッセージ: %+v", message)

		if message["type"] == "answer_request" {
			select {
			case answerRights <- playerID:
				log.Printf("プレイヤー %s が回答権を獲得", playerID)
				return // 回答権を得たら終了
			default:
				// 他のプレイヤーが既に回答権を取得している
				conn.WriteJSON(map[string]string{
					"status":  "answer_denied",
					"message": "他のレイヤーが回答中です",
				})
			}
		}
	}
}

func handlePlayerAnswer(room *Room, playerID string, correctAnswer string) bool {
	log.Printf("プレイヤー %s の回答を待機中", playerID)

	var conn *websocket.Conn
	var otherConn *websocket.Conn

	if playerID == room.PlayerID {
		conn = room.Player1Conn
		otherConn = room.Player2Conn
	} else {
		conn = room.Player2Conn
		otherConn = room.Player1Conn
	}

	// 回答を待機
	answerTimeout := time.After(5 * time.Second)
	answerChan := make(chan string)

	go func() {
		var answer map[string]string
		if err := conn.ReadJSON(&answer); err == nil {
			log.Printf("回答を受信: %+v", answer)
			answerChan <- answer["answer"]
		} else {
			log.Printf("回答受信エラー: %v", err)
		}
	}()

	select {
	case answer := <-answerChan:
		isCorrect := answer == correctAnswer
		log.Printf("回答結果: %v (正解: %s, 回答: %s)", isCorrect, correctAnswer, answer)

		resultMessage := map[string]interface{}{
			"status":         "answer_result",
			"correct":        isCorrect,
			"answer":         answer,
			"correct_answer": correctAnswer,
		}
		conn.WriteJSON(resultMessage)
		otherConn.WriteJSON(resultMessage)
		return isCorrect

	case <-answerTimeout:
		log.Printf("回答タイムアウト")
		timeoutMessage := map[string]string{
			"status":  "answer_timeout",
			"message": "回答時間切れ",
		}
		conn.WriteJSON(timeoutMessage)
		otherConn.WriteJSON(timeoutMessage)
		return false
	}
}

func waitForMatch(room *Room) bool {
	// タイムアウト用のティッカーを設定（5秒後にタイムアウト）
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for {
		// マッチングが成功した場合は即座にtrueを返して終了
		if room.IsMatched {
			return true
		}

		select {
		case <-ticker.C:
			// タイムアウト時の処理
			roomsMutex.Lock()
			if !room.IsMatched {
				// マッチングが成立していない場合、部屋を削除してタイムアウトを通知
				delete(rooms, room.ID)
				room.Player1Conn.WriteJSON(map[string]string{
					"status": "timeout",
				})
				roomsMutex.Unlock()
				return false
			}
			roomsMutex.Unlock()
		default:
			// マッチング待機中は100ミリ秒ごとにチェック
			// CPU使用率を抑えるためのスリープ
			time.Sleep(100 * time.Millisecond)
		}
	}
}

// 勝者を決定する関数
func determineWinner(player1ID, player2ID string, score1, score2 int) map[string]string {
	if score1 > score2 {
		return map[string]string{
			"id":       player1ID,
			"loser_id": player2ID,
			"message":  "Player 1の勝利！",
		}
	} else if score2 > score1 {
		return map[string]string{
			"id":       player2ID,
			"loser_id": player1ID,
			"message":  "Player 2の勝利！",
		}
	}
	return map[string]string{
		"id":      "draw",
		"message": "引き分け",
	}
}

// レーティングを更新する関数
func updatePlayerRatings(db *sql.DB, winnerID, loserID string) {
	if winnerID == "draw" {
		return // 引き分けの場合はレーティング更新なし
	}

	// レート更新のリクエストを作成
	rateRequest := rate.RatingRequest{
		WinnerID: winnerID,
		LoserID:  loserID,
		GameType: "quiz",
	}

	// 勝者と敗者の現在のレートを取得
	winnerRating := rate.GetPlayerRating(db, rateRequest.WinnerID)
	loserRating := rate.GetPlayerRating(db, rateRequest.LoserID)

	// レート変動を計算
	expectedScore := 1.0 / (1.0 + math.Pow(10, float64(loserRating-winnerRating)/400.0))
	ratingChange := int(math.Round(rate.KFactor * (1.0 - expectedScore)))

	winnerNewRating := winnerRating + ratingChange
	loserNewRating := loserRating - ratingChange

	// データベースを更新
	err := rate.UpdatePlayerRatings(db, rateRequest.WinnerID, winnerNewRating, rateRequest.LoserID, loserNewRating)
	if err != nil {
		log.Printf("レート更新エラー: %v", err)
		return
	}
}
