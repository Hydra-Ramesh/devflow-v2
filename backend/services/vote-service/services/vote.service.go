package services

import (
	"errors"
	"fmt"

	"github.com/Hydra-Ramesh/devflow-v2/backend/services/vote-service/config"
	"github.com/Hydra-Ramesh/devflow-v2/backend/services/vote-service/models"
	"github.com/Hydra-Ramesh/devflow-v2/backend/services/vote-service/repositories"
	"gorm.io/gorm"
)

type ToggleVoteInput struct {
	EntityID   string `json:"entityId" binding:"required"`
	EntityType string `json:"entityType" binding:"required"`
	VoteType   int    `json:"voteType"` // 1, 0, or -1
}

type VoteCastEvent struct {
	EntityID      string `json:"entityId"`
	EntityType    string `json:"entityType"`
	UserVote      int    `json:"userVote"`
	AmountChanged int    `json:"amountChanged"`
	VoterID       string `json:"voterId"`
}

func ToggleVote(input ToggleVoteInput, voterId string) (string, error) {
	if input.VoteType != 1 && input.VoteType != -1 && input.VoteType != 0 {
		return "", errors.New("invalid vote type (must be 1, -1, or 0)")
	}

	existingVote, err := repositories.FindVote(voterId, input.EntityID, input.EntityType)

	if err != nil && err != gorm.ErrRecordNotFound {
		return "", err
	}

	var previousVoteType int
	if existingVote != nil {
		previousVoteType = existingVote.Value
	} else {
		previousVoteType = 0
	}

	if previousVoteType == input.VoteType {
		return "Vote unchanged", nil
	}

	amountChanged := input.VoteType - previousVoteType

	if input.VoteType == 0 {
		if existingVote != nil {
			if err := repositories.DeleteVote(existingVote.ID.String()); err != nil {
				return "", err
			}
		}
	} else {
		if existingVote != nil {
			existingVote.Value = input.VoteType
			if err := repositories.UpdateVote(existingVote); err != nil {
				return "", err
			}
		} else {
			newVote := &models.Vote{
				UserID:     voterId,
				EntityID:   input.EntityID,
				EntityType: input.EntityType,
				Value:      input.VoteType,
			}
			if err := repositories.CreateVote(newVote); err != nil {
				return "", err
			}
		}
	}

	eventPayload := VoteCastEvent{
		EntityID:      input.EntityID,
		EntityType:    input.EntityType,
		UserVote:      input.VoteType,
		AmountChanged: amountChanged,
		VoterID:       voterId,
	}

	eventKey := fmt.Sprintf("%s:%s", input.EntityType, input.EntityID)
	err = config.PublishEvent("vote-cast", eventKey, eventPayload)
	if err != nil {
		return "", err
	}

	return "Vote recorded", nil
}
