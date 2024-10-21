package matchmaking

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"
)

var (
	rooms      = make(map[string]*Room)
	roomsMutex sync.Mutex
)

// 1対1用のマッチメイキングハンドラー
func MatchmakingHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("username")
		if err != nil {
			http.Error(w, "ユーザー名が取得できません。ログインしてください。", http.StatusUnauthorized)
			return
		}
		playerID := cookie.Value

		roomsMutex.Lock()
		defer roomsMutex.Unlock()

		// 空いている部屋を探す
		for _, room := range rooms {
			if room.PlayerID != playerID {
				// マッチング成功
				delete(rooms, room.ID)
				json.NewEncoder(w).Encode(map[string]string{
					"status":  "matched",
					"room_id": room.ID,
				})
				return
			}
		}

		// 空いている部屋がない場合、新しい部屋を作成
		newRoom := &Room{
			ID:        generateRoomID(),
			PlayerID:  playerID,
			CreatedAt: time.Now(),
		}
		rooms[newRoom.ID] = newRoom

		json.NewEncoder(w).Encode(map[string]string{
			"status":  "waiting",
			"room_id": newRoom.ID,
		})
	}
}

func generateRoomID() string {
	// ユニークな部屋IDを生成する実装
	// この例では簡単のため、現在時刻のUnixタイムスタンプを使用
	return fmt.Sprintf("%d", time.Now().UnixNano())
}
