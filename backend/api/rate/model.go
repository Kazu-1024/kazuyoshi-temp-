package rate

type RatingRequest struct {
	WinnerID string `json:"winner_id"`
	LoserID  string `json:"loser_id"`
	GameType string `json:"game_type"` // ここは今のところ"quiz"固定
}

type RatingResponse struct {
	WinnerNewRating int `json:"winner_new_rating"`
	LoserNewRating  int `json:"loser_new_rating"`
	RatingChange    int `json:"rating_change"`
}

type PlayerRating struct {
	Username string `json:"username"`
	Rating   int    `json:"rating"`
}

type Question struct {
	ID            int      `json:"id"`
	QuestionText  string   `json:"question_text"`
	CorrectAnswer string   `json:"correct_answer"`
	Choices       []string `json:"choices"`
}
