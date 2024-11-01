package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"sys3/api/account"
	"sys3/api/friends"
	"sys3/api/matchmaking"
	"sys3/api/question"
	"sys3/api/rate"

	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/mux"
)

func main() {
	// データベース接続の初期化
	connStr := "root:root@tcp(localhost:3306)/sys3"
	db, err := sql.Open("mysql", connStr)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// MySQLに接続したときのメッセージを表示
	fmt.Println("データベースに接続しました")

	// ルーターの初期化
	r := mux.NewRouter()

	// CORSミドルウェア
	r.Use(corsMiddleware)

	// ルートの設定
	r.HandleFunc("/", homeHandler).Methods("GET", "OPTIONS")
	r.HandleFunc("/signup", account.SignUpHandler(db)).Methods("POST", "OPTIONS")
	r.HandleFunc("/login", account.LoginHandler(db)).Methods("POST", "OPTIONS")
	r.HandleFunc("/logout", account.LogoutHandler()).Methods("POST")
	r.HandleFunc("/getusername", account.GetUsernameHandler(db)).Methods("GET")
	r.HandleFunc("/matchmaking", matchmaking.MatchmakingHandler(db)).Methods("POST")
	r.HandleFunc("/questions", question.MakeQuestionHandler(db)).Methods("POST")
	r.HandleFunc("/friends/request", friends.SendFriendRequestHandler(db)).Methods("POST")
	r.HandleFunc("/friends/respond", friends.RespondToFriendRequestHandler(db)).Methods("POST")
	r.HandleFunc("/friends/pending", friends.GetPendingRequestsHandler(db)).Methods("GET")
	r.HandleFunc("/rate/calculate", rate.CalculateRatingHandler(db)).Methods("POST")
	r.HandleFunc("/rate/top", rate.GetTopPlayersHandler(db)).Methods("GET")

	// サーバーの設定
	port := ":8080"
	fmt.Printf("Server is running on port %s\n", port)
	log.Fatal(http.ListenAndServe(port, r))
}

func homeHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "tihs is the go api server for sys3")
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// すべてのレスポンスヘッダーにCORS設定を追加
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Set("Access-Control-Max-Age", "3600")

		// プリフライトリクエストの処理
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}
