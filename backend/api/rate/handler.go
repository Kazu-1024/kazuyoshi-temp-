package rate

import (
	"database/sql"
	"encoding/json"
	"math"
	"net/http"
)

const (
	DefaultRating = 1500
	KFactor       = 32 // とりあえず32にしとく、大きくしたら変動レートが大きくなる
)

func CalculateRatingHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req RatingRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "無効なリクエストデータです", http.StatusBadRequest)
			return
		}

		// 勝者と敗者の現在のレートを取得
		winnerRating := getPlayerRating(db, req.WinnerID)
		loserRating := getPlayerRating(db, req.LoserID)

		// レート変動を計算
		expectedScore := 1.0 / (1.0 + math.Pow(10, float64(loserRating-winnerRating)/400.0))
		ratingChange := int(math.Round(KFactor * (1.0 - expectedScore)))

		winnerNewRating := winnerRating + ratingChange
		loserNewRating := loserRating - ratingChange

		// データベースを更新
		err := updatePlayerRatings(db, req.WinnerID, winnerNewRating, req.LoserID, loserNewRating)
		if err != nil {
			http.Error(w, "レートの更新に失敗しました", http.StatusInternalServerError)
			return
		}

		// レスポンスを返す
		response := RatingResponse{
			WinnerNewRating: winnerNewRating,
			LoserNewRating:  loserNewRating,
			RatingChange:    ratingChange,
		}
		json.NewEncoder(w).Encode(response)
	}
}

func getPlayerRating(db *sql.DB, username string) int {
	var rating int
	err := db.QueryRow("SELECT rating FROM player_ratings WHERE username = ?", username).Scan(&rating)
	if err != nil {
		// プレイヤーが見つからない場合は、デフォルトレートを返す
		return DefaultRating
	}
	return rating
}

func updatePlayerRatings(db *sql.DB, winnerID string, winnerNewRating int, loserID string, loserNewRating int) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}

	// 勝者のレートを更新
	_, err = tx.Exec(`
		INSERT INTO player_ratings (username, rating) 
		VALUES (?, ?) 
		ON DUPLICATE KEY UPDATE rating = ?`,
		winnerID, winnerNewRating, winnerNewRating)
	if err != nil {
		tx.Rollback()
		return err
	}

	// 敗者のレートを更新
	_, err = tx.Exec(`
		INSERT INTO player_ratings (username, rating) 
		VALUES (?, ?) 
		ON DUPLICATE KEY UPDATE rating = ?`,
		loserID, loserNewRating, loserNewRating)
	if err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit()
}

// レーティング上位10人のプレイヤーを返すハンドラー
func GetTopPlayersHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// 上位10人のプレイヤーを取得
		rows, err := db.Query(`
			SELECT username, rating 
			FROM player_ratings 
			ORDER BY rating DESC 
			LIMIT 50
		`)
		if err != nil {
			http.Error(w, "ランキングの取得に失敗しました", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		// 結果を格納するスライス
		var topPlayers []PlayerRating

		// 結果を処理
		for rows.Next() {
			var player PlayerRating
			if err := rows.Scan(&player.Username, &player.Rating); err != nil {
				http.Error(w, "データの読み取りに失敗しました", http.StatusInternalServerError)
				return
			}
			topPlayers = append(topPlayers, player)
		}

		// レスポンスを返す
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(topPlayers)
	}
}

// GetPlayerRating プレイヤーのレートを取得する関数を公開
func GetPlayerRating(db *sql.DB, username string) int {
	return getPlayerRating(db, username)
}

// UpdatePlayerRatings レートを更新する関数を公開
func UpdatePlayerRatings(db *sql.DB, winnerID string, winnerNewRating int, loserID string, loserNewRating int) error {
	return updatePlayerRatings(db, winnerID, winnerNewRating, loserID, loserNewRating)
}

// GetUserRatingHandler ログインしているユーザーのレートを返すハンドラー
func GetUserRatingHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// クッキーからユーザー名を取得
		cookie, err := r.Cookie("username")
		if err != nil {
			http.Error(w, "ログインが必要です", http.StatusUnauthorized)
			return
		}

		// ユーザーのレートを取得
		rating := getPlayerRating(db, cookie.Value)

		// レスポンスを返す
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"username": cookie.Value,
			"rating":   rating,
		})
	}
}
