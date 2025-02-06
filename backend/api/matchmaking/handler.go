package matchmaking

import (
	"database/sql"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

var (
	rooms      = make(map[string]*Room)
	players    = make(map[string]*PlayerState)
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
			"status":  "unauthorized",
			"message": "ログインが必要です",
		})
		return
	}

	fmt.Printf("見つかったユーザー名クキー: %+v\n", cookie)

	fmt.Printf("WebSocket接続確立: %s\n", cookie.Value)

	roomsMutex.Lock()

	// 空いている部屋を探す
	var matchedRoom *Room
	for _, room := range rooms {
		if room.PlayerID != cookie.Value && !room.IsMatched {
			matchedRoom = room
			matchedRoom.IsMatched = false
			matchedRoom.Player2ID = cookie.Value
			break
		}
	}
	

	if matchedRoom != nil {
		// マッチング成功時の処理
		matchedRoom.IsMatched = true
		matchedRoom.Player2ID = cookie.Value
		matchedRoom.Player2Conn = conn
		roomsMutex.Unlock()

		// マッチング成功通知
		matchResponse := map[string]string{
			"status":  "matched",
			"room_id": matchedRoom.ID,
			"player_id": cookie.Value,
		}
		matchedRoom.Player1Conn.WriteJSON(matchResponse)
		conn.WriteJSON(matchResponse)

		// ゲームセッションを開始
		go handleGameSession(matchedRoom) // goroutineで実行

		// 接続を維持
		select {}
	}

	// マッチする部屋が見つかなかった場合、新しい部屋を作成
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
		"player_id": newRoom.PlayerID,
	})
	//messageを監視する関数
	go handlePlayerMessages(conn, cookie.Value, newRoom)
	
	select {}
}

func generateRoomID() string {
	// ユニークな部屋IDを生成する実装
	return fmt.Sprintf("%d", time.Now().UnixNano())
}

func waitForMatch(room *Room) bool {
	// タイムアウト時間を300秒に延長
	ticker := time.NewTicker(300 * time.Second)
	defer ticker.Stop()

	for {
		roomsMutex.Lock()
		if room.IsMatched {
			roomsMutex.Unlock()
			return true
		}
		roomsMutex.Unlock()

		select {
		case <-ticker.C:
			roomsMutex.Lock()
			if !room.IsMatched {
				delete(rooms, room.ID)
				room.Player1Conn.WriteJSON(map[string]string{
					"status": "timeout",
				})
				roomsMutex.Unlock()
				return false
			}
			roomsMutex.Unlock()
			// default:
			// 	time.Sleep(100 * time.Millisecond)
		}
	}
}

// プレイヤーの状態を設定
func InitPlayers(room *Room) {
	players[room.PlayerID] = &PlayerState{HP: 5, Point: 0}
	players[room.Player2ID] = &PlayerState{HP: 5, Point: 0}
}

func handleGameSession(room *Room) {
	if room.Player1Conn == nil || room.Player2Conn == nil {
        log.Println("playerがそろっていないためゲームを開始できません")
        return
    }
	// 問題を一括で取得
	questions, err := fetchQuestions(10)
	if err != nil {
		log.Printf("問題取得エラー: %v", err)
		return
	}

	InitPlayers(room)

	// ゲーム開始メッセージと問題データを送信
	startMessage := map[string]interface{}{
		"status":    "game_start",
		"message":   "対戦を開始します",
		"questions": questions,
		"opponent":  room.Player2ID,
		"player1Id": room.PlayerID,
		"gameStartTime": time.Now().Format(time.RFC3339),
	}

	if room.Player2Conn != nil {
        room.Player1Conn.WriteJSON(startMessage)
    }

	// Player2用のメッセージを作成（opponentをPlayer1の名前に設定）
	player2Message := map[string]interface{}{
		"status":    "game_start",
		"message":   "対戦を開始します",
		"questions": questions,
		"opponent":  room.PlayerID,
		"player1Id": room.Player2ID,
		"gameStartTime": time.Now().Format(time.RFC3339),
	}
	if room.Player1Conn != nil {
        room.Player2Conn.WriteJSON(player2Message)
    }

	log.Print(players[room.PlayerID])

	// 各プレイヤーのメッセージを監視
	go handlePlayerMessages(room.Player1Conn, room.PlayerID, room)
	go handlePlayerMessages(room.Player2Conn, room.Player2ID, room)

}

func handlePlayerMessages(conn *websocket.Conn, playerID string, room *Room) {
	for {
		var message map[string]interface{}
		err := conn.ReadJSON(&message)
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("予期せぬ接続切断: %v", err)
			}
			// エラーが発生した場合でも、接続を閉じずにループを継続
			return
		}
		if message["type"] == "match_cancel"{
			log.Print("ルーム削除要請")
			cancelMessage := map[string]interface{}{
				"status": "cancel",
			}
			room.Player1Conn.WriteJSON(cancelMessage)
			if roomId, ok := message["room_id"].(string); ok {
				delete(rooms, roomId)
			} else {
				log.Println("roomId が見つからないか、型が正しくありません")
			}
		}else if message["type"] == "try_answer" {
			// 早押し成功通知を両プレイヤーに送信
			log.Println("早押しボタンが押されました")
			answerMessage := map[string]interface{}{
				"status":   "answer_given",
				"player_id": playerID,
				"anserTime": time.Now().UnixMilli(),
			}
			room.Player1Conn.WriteJSON(answerMessage)
			room.Player2Conn.WriteJSON(answerMessage)
		}else if message["correct"] == true {
			log.Printf("%dが正解しました",playerID)
			players[playerID].Point += 1
			if players[playerID].Point >= 5 {
				// ポイントが5に達したら勝敗判定を実行
				determineWinner(room, "point_reached")
				return
			}

			answerCorrectMessage := map[string]interface{}{
				"status":   "answer_correct",
				"player_id": playerID,
			}

			room.Player1Conn.WriteJSON(answerCorrectMessage)
			room.Player2Conn.WriteJSON(answerCorrectMessage)
		}else if message["correct"] == false {
			log.Printf("%dが間違えました",playerID)
			players[playerID].HP -= 1
			if players[playerID].HP <= 0 {
				// HPが0になったら勝敗判定を実行
				determineWinner(room, "hp_zero")
				return
			}

			unlockMessage := map[string]interface{}{
				"status":   "answer_unlock",
				"player_id": playerID,
				"unlockTime": time.Now(),
			}
			log.Print(players[playerID])

			room.Player1Conn.WriteJSON(unlockMessage)
			room.Player2Conn.WriteJSON(unlockMessage)
		}else if message["type"] == "surrender"{
			//ゲームを離れるとき、disconectedを送信
			surrenderMessage := map[string]interface{}{
				"status": "disconected",
				"player_id" : playerID,
			}
			room.Player1Conn.WriteJSON(surrenderMessage)
			room.Player2Conn.WriteJSON(surrenderMessage)
		} else if message["type"] == "settingTimer"{
			//問題が表示され切った時、 
			log.Print("タイマースタート")
			setTimer := map[string]interface{}{
				"status": "timer_start",
				"startTime": time.Now().UnixMilli(),
				"player_id": playerID,
			}
			room.Player1Conn.WriteJSON(setTimer)
			room.Player2Conn.WriteJSON(setTimer)
		}else{
			log.Printf("想定されていないtypeが送信されました。処理を追加するかmassageを確認してください送られたtype[%d]",message["type"])
		}
	}
}

// 勝者を決定する関数

func determineWinner(room *Room, reason string) {
	player1 := players[room.PlayerID]
	player2 := players[room.Player2ID]

	var winnerID, loserID, message string

	if player1.HP <= 0 {
		winnerID = room.Player2ID
		loserID = room.PlayerID
		message = fmt.Sprintf("%sのHPが0になったため、%sの勝利!", loserID, winnerID)
	} else if player2.HP <= 0 {
		winnerID = room.PlayerID
		loserID = room.Player2ID
		message = fmt.Sprintf("%sのHPが0になったため、%sの勝利!", loserID, winnerID)
	} else if player1.Point >= 5 {
		winnerID = room.PlayerID
		loserID = room.Player2ID
		message = fmt.Sprintf("%sが5ポイント獲得!勝利!", winnerID)
	} else if player2.Point >= 5 {
		winnerID = room.Player2ID
		loserID = room.PlayerID
		message = fmt.Sprintf("%sが5ポイント獲得!勝利!", winnerID)
	} else if reason == "lastQuestion" {
		// 最終問題の判定
		if player1.Point > player2.Point {
			winnerID = room.PlayerID
			loserID = room.Player2ID
			message = fmt.Sprintf("最終問題終了!%sのポイントが多いため勝利!", winnerID)
		} else if player2.Point > player1.Point {
			winnerID = room.Player2ID
			loserID = room.PlayerID
			message = fmt.Sprintf("最終問題終了!%sのポイントが多いため勝利!", winnerID)
		} else {
			message = "draw"
		}
	} else {
		return
	}

	// 勝敗メッセージ送信
	winnerMessage := map[string]interface{}{
		"status":   "game_end",
		"winner":   winnerID,
		"loser":    loserID,
		"message":  message,
	}

	room.Player1Conn.WriteJSON(winnerMessage)
	room.Player2Conn.WriteJSON(winnerMessage)

	// ルーム削除
	roomsMutex.Lock()
	delete(rooms, room.ID)
	roomsMutex.Unlock()
}




// // レート計算と更新
// func updatePlayerRatings(db *sql.DB, winnerID, loserID string) {
// 	if winnerID == "draw" {
// 		return // 引き分けの場合はレーティング更新なし
// 	}

// 	// レート更新のリクエストを作成
// 	rateRequest := rate.RatingRequest{
// 		WinnerID: winnerID,
// 		LoserID:  loserID,
// 		GameType: "quiz",
// 	}

// 	// レート計算ハンドラーを使用してレートを更新
// 	handler := rate.CalculateRatingHandler(db)

// 	// リクエストを作成
// 	reqBody, _ := json.Marshal(rateRequest)
// 	req, _ := http.NewRequest("POST", "/calculate-rating", bytes.NewBuffer(reqBody))

// 	// レスポンスを受け取るためのRecorderを作成
// 	w := httptest.NewRecorder()

// 	// ハンドラーを実行
// 	handler.ServeHTTP(w, req)

// 	// エラーチェック
// 	if w.Code != http.StatusOK {
// 		log.Printf("レート更新エラー: %v", w.Body.String())
// 		return
// 	}
// }

// InitDB データベース接続を初期化する
func InitDB(database *sql.DB) {
	db = database
}

// 問題を一括取得する関数を追加
func fetchQuestions(count int) ([]Question, error) {
	// まず全ての問題IDを取得
	var questionIDs []int
	rows, err := db.Query("SELECT id FROM questions")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var id int
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		questionIDs = append(questionIDs, id)
	}

	// ランダムにcount個のIDを選択
	rand.Seed(time.Now().UnixNano())
	rand.Shuffle(len(questionIDs), func(i, j int) {
		questionIDs[i], questionIDs[j] = questionIDs[j], questionIDs[i]
	})

	// 選択したcount個の問題を取得
	selectedIDs := questionIDs
	if len(questionIDs) > count {
		selectedIDs = questionIDs[:count]
	}

	// 選択した問題の詳細を取得
	questions := make([]Question, 0, len(selectedIDs))
	for _, id := range selectedIDs {
		var q Question
		var choice1, choice2, choice3, choice4 string
		err := db.QueryRow(`
			SELECT id, question_text, question_type, correct_answer, choice1, choice2, choice3, choice4 
			FROM questions 
			WHERE id = ?
		`, id).Scan(
			&q.ID,
			&q.QuestionText,
			&q.QuestionType,
			&q.CorrectAnswer,
			&choice1,
			&choice2,
			&choice3,
			&choice4,
		)
		if err != nil {
			return nil, err
		}
		q.Choices = []string{choice1, choice2, choice3, choice4}
		questions = append(questions, q)
	}

	return questions, nil
}
