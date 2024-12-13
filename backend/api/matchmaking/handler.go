package matchmaking

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"net/http/httptest"
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
	})

	// マッチングを待機
	if waitForMatch(newRoom) {
		// 部屋作成者（Player1）の場合のみゲームセッションを開始
		handleGameSession(newRoom)
	}
	// マッチングがタイムアウトした場合は、この時点で処理が終了する
}

func generateRoomID() string {
	// ユニークな部屋IDを生成する実装
	return fmt.Sprintf("%d", time.Now().UnixNano())
}

func handleGameSession(room *Room) {
	// 問題を一括で取得
	questions, err := fetchQuestions(5)
	if err != nil {
		log.Printf("問題取得エラー: %v", err)
		return
	}

	// ゲーム開始メッセージと問題データを送信
	startMessage := map[string]interface{}{
		"status":    "game_start",
		"message":   "対戦を開始します",
		"questions": questions,
	}

	room.Player1Conn.WriteJSON(startMessage)
	room.Player2Conn.WriteJSON(startMessage)

	// 早押し処理用のチャネル
	answerRights := make(chan string, 1)

	// 各プレイヤーの早押しメッセージを監視
	go handleAnswerRequest(room.Player1Conn, room.PlayerID, answerRights)
	go handleAnswerRequest(room.Player2Conn, room.Player2ID, answerRights)

	// メインゲームループ
	for {
		select {
		case playerID := <-answerRights:
			// 早押し成功通知を両プレイヤーに送信
			answerMessage := map[string]interface{}{
				"status":   "answer_given",
				"playerId": playerID,
			}
			room.Player1Conn.WriteJSON(answerMessage)
			room.Player2Conn.WriteJSON(answerMessage)

			// プレイヤーの回答を待機
			var answerResult map[string]interface{}
			var answeredConn *websocket.Conn
			if playerID == room.PlayerID {
				answeredConn = room.Player1Conn
			} else {
				answeredConn = room.Player2Conn
			}
			err := answeredConn.ReadJSON(&answerResult)
			if err != nil {
				log.Printf("回答受信エラー: %v", err)
				continue
			}

			// 受信した回答結果をログに出力
			log.Printf("受信した回答結果: %+v", answerResult)

			// 回答結果を処理
			isCorrect := answerResult["correct"].(bool)

			// 誤答の場合、answer_unlockを送信
			if !isCorrect {
				unlockMessage := map[string]interface{}{
					"status": "answer_unlock",
				}
				room.Player1Conn.WriteJSON(unlockMessage)
				room.Player2Conn.WriteJSON(unlockMessage)
			}
		}
	}
}

func handleAnswerRequest(conn *websocket.Conn, playerID string, answerRights chan<- string) {
	for {
		var message map[string]interface{}
		err := conn.ReadJSON(&message)
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("予期せぬ接続切断: %v", err)
			}
			return
		}

		if message["type"] == "answer_right" {
			select {
			case answerRights <- playerID:
				// 早押し成功
				log.Printf("プレイヤー %s が回答権を獲得", playerID)
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

// レート計算と更新
func updatePlayerRatings(db *sql.DB, winnerID, loserID string) {
	if winnerID == "draw" {
		return // 引き分けの場合はレーティング更新なし
	}

	// レート更新のリク���ストを作成
	rateRequest := rate.RatingRequest{
		WinnerID: winnerID,
		LoserID:  loserID,
		GameType: "quiz",
	}

	// レート計算ハンドラーを使用してレートを更新
	handler := rate.CalculateRatingHandler(db)

	// リクエストを作成
	reqBody, _ := json.Marshal(rateRequest)
	req, _ := http.NewRequest("POST", "/calculate-rating", bytes.NewBuffer(reqBody))

	// レスポンスを受け取るためのRecorderを作成
	w := httptest.NewRecorder()

	// ハンドラーを実行
	handler.ServeHTTP(w, req)

	// エラーチェック
	if w.Code != http.StatusOK {
		log.Printf("レート更新エラー: %v", w.Body.String())
		return
	}
}

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
			SELECT id, question_text, correct_answer, choice1, choice2, choice3, choice4 
			FROM questions 
			WHERE id = ?
		`, id).Scan(
			&q.ID,
			&q.QuestionText,
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
