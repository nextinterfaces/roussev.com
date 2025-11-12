package models

import (
	"context"
	"database/sql"
	"fmt"
	"time"
)

// Greeting represents a greeting message
type Greeting struct {
	ID        int       `json:"id"`
	Name      string    `json:"name"`
	Message   string    `json:"message"`
	CreatedAt time.Time `json:"created_at"`
}

// CreateGreetingRequest represents the request to create a greeting
type CreateGreetingRequest struct {
	Name string `json:"name" validate:"required"`
}

// GreetingRepository handles database operations for greetings
type GreetingRepository struct {
	db *sql.DB
}

// NewGreetingRepository creates a new greeting repository
func NewGreetingRepository(db *sql.DB) *GreetingRepository {
	return &GreetingRepository{db: db}
}

// Create creates a new greeting
func (r *GreetingRepository) Create(ctx context.Context, name string) (*Greeting, error) {
	message := fmt.Sprintf("Hello, %s! Welcome to the Go Echo service.", name)
	
	query := `
		INSERT INTO greetings (name, message)
		VALUES ($1, $2)
		RETURNING id, name, message, created_at
	`

	greeting := &Greeting{}
	err := r.db.QueryRowContext(ctx, query, name, message).Scan(
		&greeting.ID,
		&greeting.Name,
		&greeting.Message,
		&greeting.CreatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create greeting: %w", err)
	}

	return greeting, nil
}

// GetAll retrieves all greetings
func (r *GreetingRepository) GetAll(ctx context.Context) ([]*Greeting, error) {
	query := `
		SELECT id, name, message, created_at
		FROM greetings
		ORDER BY created_at DESC
		LIMIT 100
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query greetings: %w", err)
	}
	defer rows.Close()

	var greetings []*Greeting
	for rows.Next() {
		greeting := &Greeting{}
		err := rows.Scan(
			&greeting.ID,
			&greeting.Name,
			&greeting.Message,
			&greeting.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan greeting: %w", err)
		}
		greetings = append(greetings, greeting)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating greetings: %w", err)
	}

	return greetings, nil
}

// GetByID retrieves a greeting by ID
func (r *GreetingRepository) GetByID(ctx context.Context, id int) (*Greeting, error) {
	query := `
		SELECT id, name, message, created_at
		FROM greetings
		WHERE id = $1
	`

	greeting := &Greeting{}
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&greeting.ID,
		&greeting.Name,
		&greeting.Message,
		&greeting.CreatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("greeting not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get greeting: %w", err)
	}

	return greeting, nil
}

