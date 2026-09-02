package controllers

import (
	"net/http"

	"github.com/Hydra-Ramesh/devflow-v2/backend/services/vote-service/services"
	"github.com/gin-gonic/gin"
)

func ToggleVote(c *gin.Context) {
	userId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Unauthorized"})
		return
	}

	var input services.ToggleVoteInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": err.Error()})
		return
	}

	message, err := services.ToggleVote(input, userId.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": message, "voteType": input.VoteType})
}
