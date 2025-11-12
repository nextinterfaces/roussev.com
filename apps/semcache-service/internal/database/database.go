package database

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"time"

	_ "github.com/lib/pq"
	"github.com/nextinterfaces/semcache-service/internal/config"
)

// DB wraps the database connection
type DB struct {
	*sql.DB
}

// New creates a new database connection
func New(cfg *config.DatabaseConfig) (*DB, error) {
	connStr := cfg.ConnectionString()
	
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Set connection pool settings
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	// Test the connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := db.PingContext(ctx); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	log.Printf("Connected to database: %s:%d/%s", cfg.Host, cfg.Port, cfg.Database)

	return &DB{db}, nil
}

// InitSchema initializes the database schema
func (db *DB) InitSchema(ctx context.Context) error {
	query := `
		CREATE TABLE IF NOT EXISTS greetings (
			id SERIAL PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			message TEXT NOT NULL,
			created_at TIMESTAMP NOT NULL DEFAULT NOW()
		);
	`

	_, err := db.ExecContext(ctx, query)
	if err != nil {
		return fmt.Errorf("failed to create schema: %w", err)
	}

	log.Println("Database schema initialized")
	return nil
}

// HealthCheck checks if the database is healthy
func (db *DB) HealthCheck(ctx context.Context) error {
	return db.PingContext(ctx)
}

// Close closes the database connection
func (db *DB) Close() error {
	return db.DB.Close()
}

