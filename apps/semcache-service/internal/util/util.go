package util

import (
	"github.com/nextinterfaces/semcache-service/internal/config"
)

func RedactedConfig(cfg *config.Config) *config.Config {
	copy := *cfg // shallow copy
	copy.Database.Database = "***"
	copy.Database.User = "***"
	copy.Database.Password = "***"
	return &copy
}
