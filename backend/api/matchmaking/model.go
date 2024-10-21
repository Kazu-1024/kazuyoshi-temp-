package matchmaking

import (
	"time"
)

type Room struct {
	ID        string    `json:"id"`
	PlayerID  string    `json:"player_id"`
	CreatedAt time.Time `json:"created_at"`
}

type Matchmaking struct {
	ID string `json:"id"`
}
