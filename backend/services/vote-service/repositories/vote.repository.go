package repositories

import (
	"github.com/Hydra-Ramesh/devflow-v2/backend/services/vote-service/config"
	"github.com/Hydra-Ramesh/devflow-v2/backend/services/vote-service/models"
)

func FindVote(userId string, entityId string, entityType string) (*models.Vote, error) {
	var votes []models.Vote
	result := config.DB.Where("user_id = ? AND entity_id = ? AND entity_type = ?", userId, entityId, entityType).Limit(1).Find(&votes)
	if result.Error != nil {
		return nil, result.Error
	}
	if len(votes) == 0 {
		return nil, nil
	}
	return &votes[0], nil
}

func CreateVote(vote *models.Vote) error {
	return config.DB.Create(vote).Error
}

func UpdateVote(vote *models.Vote) error {
	return config.DB.Save(vote).Error
}

func DeleteVote(voteId string) error {
	return config.DB.Delete(&models.Vote{}, "id = ?", voteId).Error
}
