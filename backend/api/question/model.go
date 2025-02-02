package question

type Question struct {
	ID              int      `json:"id"`
	CreatorUsername string   `json:"creator_username"`
	QuestionText    string   `json:"question_text"`
	QuestionType    string   `json:"question_type"`
	CorrectAnswer   string   `json:"correct_answer"`
	Choices         []string `json:"choices"`
	Explanation     string   `json:"explanation"`
}
