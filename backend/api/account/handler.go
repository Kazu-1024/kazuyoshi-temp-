package account

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"

	"io"
	"os"
	"path/filepath"
	"strings"
	"time"
	
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

// ユーザーのアイコンを登録するハンドラ
func UploadIconHandler(db *sql.DB, uploadDir string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// POSTメソッド以外はエラー
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		// multipart/form-data の解析（メモリ上は最大10MB）
		err := r.ParseMultipartForm(10 << 20)
		if err != nil {
			http.Error(w, "フォームデータの解析に失敗しました", http.StatusBadRequest)
			return
		}

		// フォームフィールド "icon" からファイルを取得
		file, handler, err := r.FormFile("icon")
		if err != nil {
			http.Error(w, "ファイルの取得に失敗しました", http.StatusBadRequest)
			return
		}
		defer file.Close()

		// ファイル名の拡張子チェック（例：jpg, jpeg, png, gifのみ許可）
		ext := strings.ToLower(filepath.Ext(handler.Filename))
		allowedExtensions := map[string]bool{
			".jpg":  true,
			".jpeg": true,
			".png":  true,
		}
		if !allowedExtensions[ext] {
			http.Error(w, "対応していないファイル形式です", http.StatusBadRequest)
			return
		}

		// ユーザー名は Cookie ("username") から取得（ログイン済みである前提）
		cookie, err := r.Cookie("username")
		if err != nil {
			http.Error(w, "ユーザーが認証されていません", http.StatusUnauthorized)
			return
		}
		username := cookie.Value

		// ユニークなファイル名を生成
		// ※ユーザー名＋タイムスタンプで作成（必要に応じて UUID 等の利用も検討）
		newFileName := fmt.Sprintf("%s_%d%s", username, time.Now().Unix(), ext)
		// サーバー内の保存先パス
		dstPath := filepath.Join(uploadDir, newFileName)
		// DB には、フロントエンドからアクセスできる相対パスを登録（例: "/uploads/username_timestamp.jpg"）
		dbFilePath := "/uploads/" + newFileName

		// 保存先のファイルを作成
		dst, err := os.Create(dstPath)
		if err != nil {
			http.Error(w, "ファイルの保存に失敗しました", http.StatusInternalServerError)
			return
		}
		defer dst.Close()

		// アップロードされたファイルの内容を保存先にコピー
		if _, err := io.Copy(dst, file); err != nil {
			http.Error(w, "ファイルの保存中にエラーが発生しました", http.StatusInternalServerError)
			return
		}

		// ユーザーのレコードを更新して、アイコンのパスを保存
		_, err = db.Exec("UPDATE users SET icon = ? WHERE username = ?", dbFilePath, username)
		if err != nil {
			http.Error(w, "データベースの更新に失敗しました", http.StatusInternalServerError)
			return
		}

		// JSON レスポンスを返す
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"message": "アイコンのアップロードに成功しました",
			"icon":    dbFilePath,
		})
	}
}

// ユーザーのアイコンを取得するハンドラ
func GetUserIconHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// ユーザー名を Cookie から取得
		cookie, err := r.Cookie("username")
		if err != nil {
			http.Error(w, "ユーザーが認証されていません", http.StatusUnauthorized)
			return
		}
		username := cookie.Value

		// DB から icon カラムを取得
		var iconPath sql.NullString
		err = db.QueryRow("SELECT icon FROM users WHERE username = ?", username).Scan(&iconPath)
		if err != nil {
			http.Error(w, "アイコン情報の取得に失敗しました", http.StatusInternalServerError)
			return
		}

		// アイコンが未設定の場合は空文字（またはデフォルト画像の URL を設定することも可能）
		path := ""
		if iconPath.Valid {
			path = iconPath.String
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"icon": path,
		})
	}
}