package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"go.opentelemetry.io/contrib/instrumentation/github.com/labstack/echo/otelecho"
	"github.com/nextinterfaces/semcache-service/internal/config"
	"github.com/nextinterfaces/semcache-service/internal/database"
	"github.com/nextinterfaces/semcache-service/internal/handlers"
	"github.com/nextinterfaces/semcache-service/internal/logger"
	"github.com/nextinterfaces/semcache-service/internal/models"
	"github.com/nextinterfaces/semcache-service/internal/util"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.24.0"
)

func main() {
	if err := run(); err != nil {
		log.Fatalf("Application error: %v", err)
	}
}

func run() error {
	cfg, err := config.Load()
	cfgJSON, _ := json.MarshalIndent(util.RedactedConfig(cfg), "", "  ")
	if err != nil {
		return fmt.Errorf("failed to load config: %w", err)
	}

	// Initialize logger
	logger.InitLogger(cfg.Debug)
	defer logger.Sync()

	logger.Logger.Info("Starting semcache-service")
	logger.Logger.Debug("Debug mode enabled")
	logger.Logger.Info("Loaded configuration:\n" + string(cfgJSON))
	//logger.Logger.Info("Server port", zap.Int("port", cfg.Server.Port))

	// Initialize OpenTelemetry
	if cfg.OTEL.Enabled {
		shutdown, err := initTracer(cfg)
		if err != nil {
			logger.Logger.Warn(fmt.Sprintf("Failed to initialize tracer: %v", err))
		} else {
			defer shutdown()
			logger.Logger.Info(fmt.Sprintf("OpenTelemetry tracing enabled: %s", cfg.OTEL.Endpoint))
		}
	}

	// Connect to database
	db, err := database.New(&cfg.Database)
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}
	defer db.Close()

	// Initialize database schema
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := db.InitSchema(ctx); err != nil {
		return fmt.Errorf("failed to initialize schema: %w", err)
	}

	// Create repositories
	cacheRepo := models.NewCacheRepository(db.DB)

	// Create handlers
	h := handlers.New(cacheRepo, cfg.Server.CommitSHA)

	// Create Echo instance
	e := echo.New()
	e.HideBanner = true

	// Middleware
	e.Use(otelecho.Middleware(cfg.OTEL.ServiceName))
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	e.GET("/v1/health", h.Health)

	e.GET("/docs", h.ServeSwaggerUI)
	e.GET("/api/openapi.yaml", h.ServeOpenAPISpec)

	api := e.Group("/v1")
	api.POST("/create", h.Create)
	api.POST("/search", h.Search)

	port := cfg.Server.Port
	go func() {
		addr := fmt.Sprintf(":%d", port)
		if err := e.Start(addr); err != nil {
			logger.Logger.Error(fmt.Sprintf("Server error: %v", err))
		}
	}()

	logger.Logger.Info(fmt.Sprintf("Server started, endpoints:"))
	logger.Logger.Info(fmt.Sprintf("  http://localhost:%d/v1/health", port))
	logger.Logger.Info(fmt.Sprintf("  http://localhost:%d/docs", port))
	logger.Logger.Info(fmt.Sprintf("  POST http://localhost:%d/v1/create", port))
	logger.Logger.Info(fmt.Sprintf("  POST http://localhost:%d/v1/search", port))

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
	<-quit

	logger.Logger.Info(fmt.Sprintf("Shutting down server..."))

	// Graceful shutdown with timeout
	ctx, cancel = context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := e.Shutdown(ctx); err != nil {
		return fmt.Errorf("server shutdown error: %w", err)
	}

	logger.Logger.Info(fmt.Sprintf("Server stopped"))
	return nil
}

// initTracer initializes OpenTelemetry tracer
func initTracer(cfg *config.Config) (func(), error) {
	ctx := context.Background()

	// Create OTLP HTTP exporter
	exporter, err := otlptracehttp.New(ctx,
		otlptracehttp.WithEndpoint(cfg.OTEL.Endpoint),
		otlptracehttp.WithInsecure(),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create exporter: %w", err)
	}

	res, err := resource.New(ctx,
		resource.WithAttributes(
			semconv.ServiceNameKey.String(cfg.OTEL.ServiceName),
			semconv.ServiceVersionKey.String(cfg.Server.CommitSHA),
		),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create resource: %w", err)
	}

	// Create tracer provider
	tp := sdktrace.NewTracerProvider(
		sdktrace.WithBatcher(exporter),
		sdktrace.WithResource(res),
	)

	otel.SetTracerProvider(tp)

	return func() {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		if err := tp.Shutdown(ctx); err != nil {
			logger.Logger.Info(fmt.Sprintf("Error shutting down tracer provider: %v", err))
		}
	}, nil
}
