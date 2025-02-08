package vocabulary

import (
	"database/sql"
	"encoding/json"
	"net/http"
)

func MakeVocabularyHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// ユーザー認証の確認
		cookie, err := r.Cookie("username")
		if err != nil {
			http.Error(w, "ログインが必要です", http.StatusUnauthorized)
			return
		}

		// リクエストボディの解析
		var vocabulary Vocabulary
		if err := json.NewDecoder(r.Body).Decode(&vocabulary); err != nil {
			http.Error(w, "無効なリクエストデータです", http.StatusBadRequest)
			return
		}

		// // バリデーション
		// if len(question.Choices) != 4 {
		// 	http.Error(w, "選択肢は4つ必要です", http.StatusBadRequest)
		// 	return
		// }

		// データベースに問題を保存
		_, err = db.Exec(
			"INSERT INTO vocabulary_book (creator_username, vocabulary, meaning) VALUES (?, ?, ?)",
			cookie.Value,
			vocabulary.VocabularyText,
			vocabulary.Meaning,
			)

		if err != nil {
			http.Error(w, "問題の保存に失敗しました", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]string{
			"message": "問題が正常に作成されました",
		})
	}
}

// とりあえずいったん全ての問題を取得するハンドラー
func GetVocabularyHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// クッキーから username を取得
		cookie, err := r.Cookie("username")
		if err != nil {
			http.Error(w, "ログインが必要です", http.StatusUnauthorized)
			return
		}

		// レスポンスヘッダーの設定
		w.Header().Set("Content-Type", "application/json")

		// クッキーから取得した username を使用
		name := cookie.Value

		// データベースから指定されたユーザーの問題を取得
		rows, err := db.Query(`
			SELECT id, creator_username, vocabulary,meaning
			FROM vocabulary_book
			WHERE creator_username = ?`, name)
		if err != nil {
			http.Error(w, "問題の取得に失敗しました", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		// 問題のスライスを作成
		var vocabulary []Vocabulary
		for rows.Next() {
			var q Vocabulary
			err := rows.Scan(
				&q.ID,
				&q.CreatorUsername,
				&q.VocabularyText, 
				&q.Meaning, 
			)
			if err != nil {
				http.Error(w, "データの読み取りに失敗しました", http.StatusInternalServerError)
				return
			}
			vocabulary = append(vocabulary, q)
		}

		// エラーチェック
		if err = rows.Err(); err != nil {
			http.Error(w, "データの読み取り中にエラーが発生しました", http.StatusInternalServerError)
			return
		}

		// 結果をJSONで返す
		json.NewEncoder(w).Encode(vocabulary)
	}
}
