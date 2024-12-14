package account

import (
	"database/sql"
	"encoding/json"
	"fmt"
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

		// ちょっと新規作成の時にエラーが起きちゃったからjson形式で返すようにしてみた
        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusCreated)
        // w.Write([]byte("アカウントの作成に成功しました"))
        json.NewEncoder(w).Encode(map[string]string{
            "message":  "アカウントの作成に成功しました",
        })
	}
}

// ログインハンドラ
func LoginHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		fmt.Printf("Login request received from origin: %s\n", r.Header.Get("Origin"))

		var account Account
		if err := json.NewDecoder(r.Body).Decode(&account); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		// データベースからユーザーを取得
		var storedPassword string
		err := db.QueryRow("SELECT password FROM users WHERE username = ?", account.Username).Scan(&storedPassword)
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

		// クッキーの設定を修正
		cookie := &http.Cookie{
			Name:     "username",
			Value:    account.Username,
			Path:     "/",
			MaxAge:   86400,
			HttpOnly: false, // JavaScriptからアクセス可能に
			Secure:   false, // 開発環境ではfalse
			SameSite: http.SameSiteLaxMode,
		}
		http.SetCookie(w, cookie)

		// デバッグ用のログ
		fmt.Printf("Setting cookie: %+v\n", cookie)
		fmt.Printf("Response headers after setting cookie: %+v\n", w.Header())

		// レスポンスを返す前にContent-Typeを設定
		w.Header().Set("Content-Type", "application/json")

		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":   "success",
			"message":  "ログインに成功しました",
			"username": account.Username,
		})
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
