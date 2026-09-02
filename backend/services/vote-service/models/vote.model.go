package models

import (
	"time"

	"github.com/google/uuid"
)

type Vote struct {
	ID         uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	UserID     string    `gorm:"type:varchar(255);not null;uniqueIndex:idx_user_entity"`
	EntityType string    `gorm:"type:varchar(50);not null;uniqueIndex:idx_user_entity"`
	EntityID   string    `gorm:"type:varchar(255);not null;uniqueIndex:idx_user_entity"`
	Value      int       `gorm:"not null"`
	CreatedAt  time.Time `gorm:"autoCreateTime"`
}
