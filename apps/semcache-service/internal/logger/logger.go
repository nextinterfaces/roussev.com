package logger

import (
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

var (
	// global logger instance
	Logger *zap.Logger
)

// initializes the global logger
func InitLogger(debug bool) {
	var config zap.Config
	if debug {
		config = zap.NewDevelopmentConfig()
		config.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
	} else {
		config = zap.NewProductionConfig()
		config.EncoderConfig.MessageKey = "message"
		config.EncoderConfig.LevelKey = "level"
		config.EncoderConfig.EncodeLevel = zapcore.LowercaseLevelEncoder
		config.EncoderConfig.TimeKey = "time"
		config.EncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
	}

	var err error
	Logger, err = config.Build()
	if err != nil {
		panic("failed to initialize logger: " + err.Error())
	}
}

// Sync flushes any buffered log entries
func Sync() {
	_ = Logger.Sync()
}
