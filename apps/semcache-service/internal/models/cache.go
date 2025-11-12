package models

import (
	"context"
	"database/sql"
	"fmt"
	"time"
)

// CacheEntry represents a semantic cache entry
type CacheEntry struct {
	ID        int       `json:"id"`
	Key       string    `json:"key"`
	Value     string    `json:"value"`
	Metadata  string    `json:"metadata,omitempty"`
	CreatedAt time.Time `json:"created_at"`
	ExpiresAt *time.Time `json:"expires_at,omitempty"`
}

// CreateRequest represents the request to create a cache entry
type CreateRequest struct {
	Key      string `json:"key" validate:"required"`
	Value    string `json:"value" validate:"required"`
	Metadata string `json:"metadata,omitempty"`
	TTL      *int   `json:"ttl,omitempty"` // TTL in seconds
}

// SearchRequest represents the request to search cache entries
type SearchRequest struct {
	Key      string `json:"key,omitempty"`
	Metadata string `json:"metadata,omitempty"`
	Limit    int    `json:"limit,omitempty"`
}

// CacheRepository handles database operations for cache entries
type CacheRepository struct {
	db *sql.DB
}

// NewCacheRepository creates a new cache repository
func NewCacheRepository(db *sql.DB) *CacheRepository {
	return &CacheRepository{db: db}
}

// Create creates a new cache entry
func (r *CacheRepository) Create(ctx context.Context, req CreateRequest) (*CacheEntry, error) {
	var expiresAt *time.Time
	if req.TTL != nil && *req.TTL > 0 {
		expiry := time.Now().Add(time.Duration(*req.TTL) * time.Second)
		expiresAt = &expiry
	}

	query := `
		INSERT INTO semcache (key, value, metadata, expires_at)
		VALUES ($1, $2, $3, $4)
		RETURNING id, key, value, metadata, created_at, expires_at
	`

	entry := &CacheEntry{}
	err := r.db.QueryRowContext(ctx, query, req.Key, req.Value, req.Metadata, expiresAt).Scan(
		&entry.ID,
		&entry.Key,
		&entry.Value,
		&entry.Metadata,
		&entry.CreatedAt,
		&entry.ExpiresAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create cache entry: %w", err)
	}

	return entry, nil
}

// Search searches for cache entries based on criteria
func (r *CacheRepository) Search(ctx context.Context, req SearchRequest) ([]*CacheEntry, error) {
	limit := req.Limit
	if limit <= 0 || limit > 100 {
		limit = 100
	}

	query := `
		SELECT id, key, value, metadata, created_at, expires_at
		FROM semcache
		WHERE (expires_at IS NULL OR expires_at > NOW())
	`
	args := []interface{}{}
	argCount := 0

	if req.Key != "" {
		argCount++
		query += fmt.Sprintf(" AND key ILIKE $%d", argCount)
		args = append(args, "%"+req.Key+"%")
	}

	if req.Metadata != "" {
		argCount++
		query += fmt.Sprintf(" AND metadata ILIKE $%d", argCount)
		args = append(args, "%"+req.Metadata+"%")
	}

	argCount++
	query += fmt.Sprintf(" ORDER BY created_at DESC LIMIT $%d", argCount)
	args = append(args, limit)

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to search cache entries: %w", err)
	}
	defer rows.Close()

	var entries []*CacheEntry
	for rows.Next() {
		entry := &CacheEntry{}
		err := rows.Scan(
			&entry.ID,
			&entry.Key,
			&entry.Value,
			&entry.Metadata,
			&entry.CreatedAt,
			&entry.ExpiresAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan cache entry: %w", err)
		}
		entries = append(entries, entry)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating cache entries: %w", err)
	}

	return entries, nil
}

// HealthCheck performs a simple query to check database connectivity
func (r *CacheRepository) HealthCheck(ctx context.Context) error {
	query := "SELECT 1"
	var result int
	err := r.db.QueryRowContext(ctx, query).Scan(&result)
	return err
}

