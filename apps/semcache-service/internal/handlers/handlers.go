package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/nextinterfaces/semcache-service/internal/models"
)

type Handler struct {
	cacheRepo *models.CacheRepository
	commitSHA string
}

func New(cacheRepo *models.CacheRepository, commitSHA string) *Handler {
	return &Handler{
		cacheRepo: cacheRepo,
		commitSHA: commitSHA,
	}
}

type HealthResponse struct {
	Status    string `json:"status"`
	Timestamp string `json:"timestamp"`
	CommitSHA string `json:"commit_sha"`
	Database  string `json:"database"`
}

func (h *Handler) Health(c echo.Context) error {
	ctx, cancel := context.WithTimeout(c.Request().Context(), 2*time.Second)
	defer cancel()

	dbStatus := "healthy"
	err := h.cacheRepo.HealthCheck(ctx)
	if err != nil {
		dbStatus = "unhealthy"
	}

	response := HealthResponse{
		Status:    "ok",
		Timestamp: time.Now().UTC().Format(time.RFC3339),
		CommitSHA: h.commitSHA,
		Database:  dbStatus,
	}

	return c.JSON(http.StatusOK, response)
}

func (h *Handler) Create(c echo.Context) error {
	var req models.CreateRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid request body",
		})
	}

	if req.Key == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Key is required",
		})
	}

	if req.Value == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Value is required",
		})
	}

	ctx, cancel := context.WithTimeout(c.Request().Context(), 5*time.Second)
	defer cancel()

	entry, err := h.cacheRepo.Create(ctx, req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to create cache entry",
		})
	}

	return c.JSON(http.StatusCreated, entry)
}

func (h *Handler) Search(c echo.Context) error {
	var req models.SearchRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid request body",
		})
	}

	ctx, cancel := context.WithTimeout(c.Request().Context(), 5*time.Second)
	defer cancel()

	entries, err := h.cacheRepo.Search(ctx, req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to search cache entries",
		})
	}

	return c.JSON(http.StatusOK, entries)
}
