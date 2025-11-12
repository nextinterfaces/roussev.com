package handlers

import (
	"context"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/nextinterfaces/hello-service/internal/models"
)

type Handler struct {
	greetingRepo *models.GreetingRepository
	commitSHA    string
}

func New(greetingRepo *models.GreetingRepository, commitSHA string) *Handler {
	return &Handler{
		greetingRepo: greetingRepo,
		commitSHA:    commitSHA,
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
	_, err := h.greetingRepo.GetAll(ctx)
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

func (h *Handler) CreateGreeting(c echo.Context) error {
	var req models.CreateGreetingRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid request body",
		})
	}

	if req.Name == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Name is required",
		})
	}

	ctx, cancel := context.WithTimeout(c.Request().Context(), 5*time.Second)
	defer cancel()

	greeting, err := h.greetingRepo.Create(ctx, req.Name)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to create greeting",
		})
	}

	return c.JSON(http.StatusCreated, greeting)
}

func (h *Handler) GetGreetings(c echo.Context) error {
	ctx, cancel := context.WithTimeout(c.Request().Context(), 5*time.Second)
	defer cancel()

	greetings, err := h.greetingRepo.GetAll(ctx)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to retrieve greetings",
		})
	}

	return c.JSON(http.StatusOK, greetings)
}

func (h *Handler) GetGreeting(c echo.Context) error {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid greeting ID",
		})
	}

	ctx, cancel := context.WithTimeout(c.Request().Context(), 5*time.Second)
	defer cancel()

	greeting, err := h.greetingRepo.GetByID(ctx, id)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{
			"error": fmt.Sprintf("record %d not found", id),
		})
	}

	return c.JSON(http.StatusOK, greeting)
}
