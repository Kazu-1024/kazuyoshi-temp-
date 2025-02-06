package question

import (
	"database/sql"
	"encoding/json"
	"net/http"
)

func MakeQuestionHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// ユーザー認証の確認
		cookie, err := r.Cookie("username")
		if err != nil {
			http.Error(w, "ログインが必要です", http.StatusUnauthorized)
			return
		}

		// リクエストボディの解析
		var question Question
		if err := json.NewDecoder(r.Body).Decode(&question); err != nil {
			http.Error(w, "無効なリクエストデータです", http.StatusBadRequest)
			return
		}

		// バリデーション
		if len(question.Choices) != 4 {
			http.Error(w, "選択肢は4つ必要です", http.StatusBadRequest)
			return
		}

		// データベースに問題を保存
		_, err = db.Exec(
			"INSERT INTO questions (creator_username, question_type, question_text, correct_answer, choice1, choice2, choice3, choice4, explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
			cookie.Value,
			question.QuestionType, // 新しいquestion_typeを追加
			question.QuestionText,
			question.CorrectAnswer,
			question.Choices[0],
			question.Choices[1],
			question.Choices[2],
			question.Choices[3],
			question.Explanation,
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
func GetQuestionHandler(db *sql.DB) http.HandlerFunc {
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
		username := cookie.Value

		// データベースから指定されたユーザーの問題を取得
		rows, err := db.Query(`
			SELECT id, creator_username, question_type, question_text, correct_answer, 
			       choice1, choice2, choice3, choice4, explanation 
			FROM questions
			WHERE creator_username = ?`, username)
		if err != nil {
			http.Error(w, "問題の取得に失敗しました", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		// 問題のスライスを作成
		var questions []Question
		for rows.Next() {
			var q Question
			var choices [4]string
			err := rows.Scan(
				&q.ID,
				&q.CreatorUsername,
				&q.QuestionType, // 追加
				&q.QuestionText,
				&q.CorrectAnswer,
				&choices[0],
				&choices[1],
				&choices[2],
				&choices[3],
				&q.Explanation,
			)
			if err != nil {
				http.Error(w, "データの読み取りに失敗しました", http.StatusInternalServerError)
				return
			}
			q.Choices = choices[:]
			questions = append(questions, q)
		}

		// エラーチェック
		if err = rows.Err(); err != nil {
			http.Error(w, "データの読み取り中にエラーが発生しました", http.StatusInternalServerError)
			return
		}

		// 結果をJSONで返す
		json.NewEncoder(w).Encode(questions)
	}
}
