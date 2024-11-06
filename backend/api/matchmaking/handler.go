package matchmaking

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"sync"
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
		handleGameSession(matchedRoom)
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

	// マッチングを待機し、成功した場合のみゲームセッションを開始
	if waitForMatch(newRoom) {
		handleGameSession(newRoom)
	}
	// マッチングがタイムアウトした場合は、この時点で処理が終了する
}

func generateRoomID() string {
	// ユニークな部屋IDを生成する実装
	return fmt.Sprintf("%d", time.Now().UnixNano())
}

func handleGameSession(room *Room) {
	// ゲーム開始メッセージを送信
	startMessage := map[string]string{
		"status":  "game_start",
		"message": "対戦を開始します",
	}
	room.Player1Conn.WriteJSON(startMessage)
	room.Player2Conn.WriteJSON(startMessage)

	// データベース接続
	db, err := sql.Open("mysql", "root:114514z4Z@tcp(localhost:3306)/sys3")
	if err != nil {
		log.Printf("データベース接続エラー: %v", err)
		return
	}
	defer db.Close()

	// スコアを管理
	player1Score := 0
	player2Score := 0

	for {
		// 問題をデータベースからランダムに取得
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
			continue
		}

		// 両プレイヤーに問題を送信
		questionMessage := map[string]interface{}{
			"status":   "question",
			"question": question,
		}
		room.Player1Conn.WriteJSON(questionMessage)
		room.Player2Conn.WriteJSON(questionMessage)

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
					"message": "他のプレイヤーが回答中です",
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
