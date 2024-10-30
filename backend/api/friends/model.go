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
