package friends

import (
	"database/sql"
	"encoding/json"
	"net/http"
)

// フレンド申請を送信するハンドラー
func SendFriendRequestHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("username")
		if err != nil {
			http.Error(w, "ログインが必要です", http.StatusUnauthorized)
			return
		}
		username := cookie.Value

		var request struct {
			FriendUsername string `json:"friend_username"`
		}
		if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
			http.Error(w, "無効なリクエストデータです", http.StatusBadRequest)
			return
		}

		// 自分自身にフレンド申請を送れないようにする
		if username == request.FriendUsername {
			http.Error(w, "自分自身にフレンド申請はできません", http.StatusBadRequest)
			return
		}

		// 既存のフレンド関係をチェック
		var exists bool
		err = db.QueryRow(
			"SELECT EXISTS(SELECT 1 FROM friends WHERE username = ? AND friend_username = ?)",
			username, request.FriendUsername,
		).Scan(&exists)
		if err != nil {
			http.Error(w, "データベースエラー", http.StatusInternalServerError)
			return
		}
		if exists {
			http.Error(w, "既にフレンドです", http.StatusBadRequest)
			return
		}

		// フレンド申請を保存
		_, err = db.Exec(
			"INSERT INTO friend_requests (username, friend_username) VALUES (?, ?)",
			username, request.FriendUsername,
		)
		if err != nil {
			http.Error(w, "フレンド申請の送信に失敗しました", http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(FriendResponse{
			Message: "フレンド申請を送信しました",
			Status:  "success",
		})
	}
}

// フレンド申請に応答するハンドラー
func RespondToFriendRequestHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("username")
		if err != nil {
			http.Error(w, "ログインが必要です", http.StatusUnauthorized)
			return
		}
		username := cookie.Value

		var request Request
		if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
			http.Error(w, "無効なリクエストデータです", http.StatusBadRequest)
			return
		}

		// ステータスを更新
		status := "rejected"
		if request.Action == "accept" {
			status = "accepted"

			// フレンド申請の情報を取得
			var senderUsername string
			err = db.QueryRow(
				"SELECT username FROM friend_requests WHERE id = ?",
				request.RequestID,
			).Scan(&senderUsername)
			if err != nil {
				http.Error(w, "フレンド申請の情報取得に失敗しました", http.StatusInternalServerError)
				return
			}

			// friendsテーブルに追加
			_, err = db.Exec(
				"INSERT INTO friends (username, friend_username) VALUES (?, ?), (?, ?)",
				username, senderUsername,
				senderUsername, username,
			)
			if err != nil {
				http.Error(w, "フレンド追加に失敗しました", http.StatusInternalServerError)
				return
			}
		}

		// friend_requestsテーブルのステータスを更新
		_, err = db.Exec(
			"UPDATE friend_requests SET status = ? WHERE id = ? AND friend_username = ?",
			status, request.RequestID, username,
		)
		if err != nil {
			http.Error(w, "フレンド申請の更新に失敗しました", http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(FriendResponse{
			Message: "フレンド申請を" + status + "しました",
			Status:  status,
		})
	}
}

// 承認待ちのフレンド申請を取得するハンドラー
func GetPendingRequestsHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("username")
		if err != nil {
			http.Error(w, "ログインが必要です", http.StatusUnauthorized)
			return
		}
		username := cookie.Value

		// 自分宛のフレンド申請を取得
		rows, err := db.Query(`
			SELECT id, username, friend_username, status 
			FROM friend_requests 
			WHERE friend_username = ? AND status = 'pending'`,
			username,
		)
		if err != nil {
			http.Error(w, "フレンド申請の取得に失敗しました", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var requests []FriendRequest
		for rows.Next() {
			var request FriendRequest
			if err := rows.Scan(&request.ID, &request.Username, &request.FriendUsername, &request.Status); err != nil {
				http.Error(w, "データの読み取りに失敗しました", http.StatusInternalServerError)
				return
			}
			requests = append(requests, request)
		}

		json.NewEncoder(w).Encode(requests)
	}
}
