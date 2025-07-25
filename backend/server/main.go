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
	"sys3/api/vocabulary"
	"sys3/api/rate"

	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/mux"
)

func main() {
	// データベース接続の初期化
	connStr := "root:root@tcp(localhost:3306)/sys3"
	var db *sql.DB
	var err error
	db, err = sql.Open("mysql", connStr)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// データベース接続のテスト
	if err = db.Ping(); err != nil {
		log.Fatal("データベース接続エラー:", err)
	}

	// データベース接続を初期化
	matchmaking.InitDB(db)

	// ルーターの初期化
	r := mux.NewRouter()

	// デバッグ用のログミドルウェアを追加
	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			fmt.Printf("受信リクエスト: %s %s\n", r.Method, r.URL.Path)
			fmt.Printf("ヘッダー: %+v\n", r.Header)
			next.ServeHTTP(w, r)
		})
	})

	// CORSミドルウェア
	r.Use(corsMiddleware)

	// WebSocketエンドポイント
	r.HandleFunc("/matchmaking", func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("マッチメイキングエンドポイントヒット")
		matchmaking.MatchmakingHandler(w, r)
	})

	// ルートの設定
	r.HandleFunc("/", homeHandler).Methods("GET", "OPTIONS")
	r.HandleFunc("/signup", account.SignUpHandler(db)).Methods("POST", "OPTIONS")
	r.HandleFunc("/login", account.LoginHandler(db)).Methods("POST", "OPTIONS")
	r.HandleFunc("/logout", account.LogoutHandler()).Methods("POST")
	r.HandleFunc("/getusername", account.GetUsernameHandler(db)).Methods("GET")
	r.HandleFunc("/postquestions", question.MakeQuestionHandler(db)).Methods("POST","OPTIONS")
	r.HandleFunc("/getquestions", question.GetQuestionHandler(db)).Methods("GET","OPTIONS")
	r.HandleFunc("/postvocabularys", vocabulary.MakeVocabularyHandler(db)).Methods("POST","OPTIONS")
	r.HandleFunc("/getvocabularys", vocabulary.GetVocabularyHandler(db)).Methods("GET","OPTIONS")
	r.HandleFunc("/friends/request", friends.SendFriendRequestHandler(db)).Methods("POST")
	r.HandleFunc("/friends/respond", friends.RespondToFriendRequestHandler(db)).Methods("POST")
	r.HandleFunc("/friends/pending", friends.GetPendingRequestsHandler(db)).Methods("GET")
	r.HandleFunc("/rate/calculate", rate.CalculateRatingHandler(db)).Methods("POST")
	r.HandleFunc("/rate/top", rate.GetTopPlayersHandler(db)).Methods("GET")
	r.HandleFunc("/rate/user", rate.GetUserRatingHandler(db)).Methods("GET")

	r.HandleFunc("/uploadicon", account.UploadIconHandler(db, "./uploads")).Methods("POST", "OPTIONS")
	r.HandleFunc("/getusericon", account.GetUserIconHandler(db)).Methods("GET", "OPTIONS")
	r.PathPrefix("/uploads/").Handler(http.StripPrefix("/uploads/", http.FileServer(http.Dir("./uploads/"))))

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
		// localhost:3000からのリクエストを許可(*が使えない)
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
		w.Header().Set("Access-Control-Expose-Headers", "Set-Cookie")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}