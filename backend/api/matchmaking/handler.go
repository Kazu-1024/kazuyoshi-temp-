package matchmaking

import (
	"fmt"
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
			origin := r.Header.Get("Origin")
			fmt.Printf("Checking origin: %s\n", origin)

			allowedOrigins := map[string]bool{
				"http://127.0.0.1:5500": true,
				"http://localhost:5500": true,
				"http://localhost:3000": true,
			}

			isAllowed := allowedOrigins[origin]
			fmt.Printf("Origin %s is allowed: %v\n", origin, isAllowed)
			return isAllowed
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
		// マッチング成功
		roomsMutex.Unlock()

		// 両プレイヤーにマッチング成功を通知
		matchedRoom.Player2Conn = conn
		matchResponse := map[string]string{
			"status":  "matched",
			"room_id": matchedRoom.ID,
		}
		matchedRoom.Player1Conn.WriteJSON(matchResponse)
		conn.WriteJSON(matchResponse)

		// マッチング後の処理（ゲーム開始など）
		handleGameSession(matchedRoom)
		return
	}

	// 新しい部屋を作成
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

	// 待機中の処理
	waitForMatch(newRoom)
}

func generateRoomID() string {
	// ユニークな部屋IDを生成する実装
	return fmt.Sprintf("%d", time.Now().UnixNano())
}

func handleGameSession(room *Room) {
	// ゲームセッションの処理を実装
	// 両プレイヤー間の通信処理など
}

func waitForMatch(room *Room) {
	// タイムアウト処理やマッチング待機中の処理を実装
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			// タイムアウト処理
			roomsMutex.Lock()
			if !room.IsMatched {
				delete(rooms, room.ID)
				room.Player1Conn.WriteJSON(map[string]string{
					"status": "timeout",
				})
			}
			roomsMutex.Unlock()
			return
		}
	}
}
