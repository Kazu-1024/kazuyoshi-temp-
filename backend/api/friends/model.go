package friends

type FriendRequest struct {
	ID             int    `json:"id"`
	Username       string `json:"username"`
	FriendUsername string `json:"friend_username"`
	Status         string `json:"status"`
}

type FriendResponse struct {
	Message string `json:"message"`
	Status  string `json:"status"`
}

type Request struct {
	RequestID int    `json:"request_id"`
	Action    string `json:"action"` // "accept" or "reject"に応じてステータスを更新
}
