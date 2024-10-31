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
