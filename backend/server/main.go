package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"sys3/api/account"
	"sys3/api/matchmaking"
	"sys3/api/question"

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
	fmt.Println("MySQLデータベースに正常に接続しました")

	// ルーターの初期化
	r := mux.NewRouter()

	// ルートの設定
	r.HandleFunc("/", homeHandler).Methods("GET")
	r.HandleFunc("/signup", account.SignUpHandler(db)).Methods("POST")
	r.HandleFunc("/login", account.LoginHandler(db)).Methods("POST")
	r.HandleFunc("/logout", account.LogoutHandler()).Methods("POST")
	r.HandleFunc("/getusername", account.GetUsernameHandler(db)).Methods("GET")
	r.HandleFunc("/matchmaking", matchmaking.MatchmakingHandler(db)).Methods("POST")
	r.HandleFunc("/questions", question.MakeQuestionHandler(db)).Methods("POST")

	// サーバーの設定
	port := ":8080"
	fmt.Printf("Server is running on port %s\n", port)
	log.Fatal(http.ListenAndServe(port, r))
}

func homeHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "tihs is the go api server for sys3")
}
