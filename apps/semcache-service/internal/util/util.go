package util

import (
	"github.com/nextinterfaces/semcache-service/internal/config"
)

func RedactedConfig(cfg *config.Config) *config.Config {
	copy := *cfg // shallow copy
	copy.Database.User = mask(copy.Database.User)
	copy.Database.Password = mask(copy.Database.Password)
	return &copy
}

func mask(s string) string {
	if len(s) > 2 {
		return s[:2] + "***"
	}
	return "***"
}
