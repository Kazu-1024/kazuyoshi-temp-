package vocabulary

type Vocabulary struct {
	ID              int      `json:"id"`
	CreatorUsername string   `json:"creator_username"`
	VocabularyText    string   `json:"vocabulary_text"`
	Meaning    string   `json:"meaning"`
}
