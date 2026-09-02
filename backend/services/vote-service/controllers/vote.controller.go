package controllers

import (
	"net/http"

	"github.com/Hydra-Ramesh/devflow-v2/backend/services/vote-service/logger"
	"github.com/Hydra-Ramesh/devflow-v2/backend/services/vote-service/services"
	"github.com/gin-gonic/gin"
)

func ToggleVote(c *gin.Context) {
	userId, exists := c.Get("userId")
	if !exists {
		logger.Error(c, "Unauthorized access attempt to ToggleVote")
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Unauthorized"})
		return
	}

	var input services.ToggleVoteInput
	if err := c.ShouldBindJSON(&input); err != nil {
		logger.Error(c, "Invalid input for ToggleVote: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": err.Error()})
		return
	}

	message, err := services.ToggleVote(input, userId.(string))
	if err != nil {
		logger.Error(c, "Failed to toggle vote: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": err.Error()})
		return
	}

	logger.Info(c, "Vote toggled successfully by %s for %s", userId.(string), input.EntityID)
	c.JSON(http.StatusOK, gin.H{"status": "success", "message": message, "voteType": input.VoteType})
}
