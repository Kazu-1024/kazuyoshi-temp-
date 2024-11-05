package account

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"golang.org/x/crypto/bcrypt"
)

// サインアップハンドラ
func SignUpHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// JSONデータをデコード
		var account Account
		err := json.NewDecoder(r.Body).Decode(&account)
		if err != nil {
			http.Error(w, "無効なJSONデータです", http.StatusBadRequest)
			return
		}

		// パスワードをハッシュ化
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(account.Password), bcrypt.DefaultCost)
		if err != nil {
			http.Error(w, "パスワードのハッシュ化に失敗しました", http.StatusInternalServerError)
			return
		}

		// データベースにアカウントを追加
		_, err = db.Exec("INSERT INTO users (username, password) VALUES (?, ?)", account.Username, string(hashedPassword))
		if err != nil {
			http.Error(w, "アカウントの作成に失敗しました", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
		w.Write([]byte("アカウントの作成に成功しました"))
	}
}

// ログインハンドラ
func LoginHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Content-Typeの設定
		w.Header().Set("Content-Type", "application/json")

		var account Account
		err := json.NewDecoder(r.Body).Decode(&account)
		if err != nil {
			http.Error(w, "無効なJSONデータです", http.StatusBadRequest)
			return
		}

		// データベースからユーザーを取得
		var storedPassword string
		err = db.QueryRow("SELECT password FROM users WHERE username = ?", account.Username).Scan(&storedPassword)
		if err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, "ユーザーが見つかりません", http.StatusUnauthorized)
			} else {
				http.Error(w, "データベースエラー", http.StatusInternalServerError)
			}
			return
		}

		// パスワードを比較
		err = bcrypt.CompareHashAndPassword([]byte(storedPassword), []byte(account.Password))
		if err != nil {
			http.Error(w, "パスワードが一致しません", http.StatusUnauthorized)
			return
		}

		// クッキーを設定
		cookie := &http.Cookie{
			Name:     "username",
			Value:    account.Username,
			Path:     "/",
			MaxAge:   86400, // 24時間
			HttpOnly: true,
			Secure:   false, // 開発環境ではfalse、本番環境ではtrueに
			SameSite: http.SameSiteLaxMode,
		}
		http.SetCookie(w, cookie)

		// 成功レスポンスを返す
		response := map[string]string{
			"status":   "success",
			"message":  "ログインに成功しました",
			"username": account.Username,
		}
		json.NewEncoder(w).Encode(response)
	}
}

// ログアウトハンドラ
func LogoutHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// クッキーを削除
		cookie := &http.Cookie{
			Name:   "username",
			Value:  "",
			Path:   "/",
			MaxAge: -1,
		}
		http.SetCookie(w, cookie)

		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ログアウトしました"))
	}
}

// ユーザー名を取得するハンドラ
func GetUsernameHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// クッキーからユーザー名を取得
		cookie, err := r.Cookie("username")
		if err != nil {
			http.Error(w, "ユーザー名が取得できません", http.StatusUnauthorized)
			return
		}

		// ユーザー名を返す
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(cookie.Value))
	}
}
