// models.go
package matchmaking

import (
	"time"

	"github.com/gorilla/websocket"
)

// Player プレイヤー情報を管理する構造体
type Player struct {
	ID       string
	Conn     *websocket.Conn
	JoinedAt time.Time
}

// Room マッチングルームを管理する構造体
type Room struct {
	ID          string
	PlayerID    string // Player1のID
	Player2ID   string
	Player1Conn *websocket.Conn
	Player2Conn *websocket.Conn
	CreatedAt   time.Time
	IsMatched   bool
	FirstAnswerTime int64
}

// GameState ゲームの状態を管理する構造体
type GameState struct {
	RoomID    string
	StartTime time.Time
	Status    string // "waiting", "matched", "playing", "finished" など
}

// PlayerState ゲーム中のplayerの情報を管理する構造体
type PlayerState struct {
    HP    int
    Point int
}

// Question ゲームの問題を管理する構造体
type Question struct {
	ID            int      `json:"id"`
	QuestionText  string   `json:"question_text"`
	QuestionType  string   `json:"question_type"`
	Choices       []string `json:"choices"`
	CorrectAnswer string   `json:"correct_answer"`
	Explanation   string   `json:"explanation"`
}
