package metrics

import (
	"context"
	"net/http"
	"time"
	"strconv"

	"github.com/labstack/echo/v4"
	promclient "github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/exporters/prometheus"
	sdkmetric "go.opentelemetry.io/otel/sdk/metric"
	"go.opentelemetry.io/otel/sdk/resource"
	semconv "go.opentelemetry.io/otel/semconv/v1.24.0"
)

var (
	exporter *prometheus.Exporter
	registry *promclient.Registry
)

// Init sets up the Prometheus exporter and HTTP instruments, and returns a net/http handler for /metrics
func Init(serviceName, serviceVersion string) (http.Handler, error) {
	var err error

	// Create a dedicated Prometheus registry and register the OTel exporter with it
	registry = promclient.NewRegistry()
	exporter, err = prometheus.New(prometheus.WithRegisterer(registry))
	if err != nil {
		return nil, err
	}

	res, _ := resource.New(
		context.Background(),
		resource.WithAttributes(
			semconv.ServiceNameKey.String(serviceName),
			semconv.ServiceVersionKey.String(serviceVersion),
		),
	)

	mp := sdkmetric.NewMeterProvider(
		sdkmetric.WithReader(exporter),
		sdkmetric.WithResource(res),
	)
	otel.SetMeterProvider(mp)

	m := otel.Meter(serviceName)
	// Ensure instruments are created upfront
	_, _ = m.Float64Histogram("http_server_duration")
	_, _ = m.Int64Counter("http_server_requests_total")

	// Expose the registry via promhttp handler
	return promhttp.HandlerFor(registry, promhttp.HandlerOpts{}), nil
}

// Middleware records HTTP metrics compatible with existing dashboards
func Middleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			start := time.Now()
			err := next(c)
			durMs := float64(time.Since(start).Microseconds()) / 1000.0

			m := otel.Meter("semcache-service")
			// Lazily (re)acquire instruments from the global provider to avoid nils
			hist, _ := m.Float64Histogram("http_server_duration")
			ctr, _ := m.Int64Counter("http_server_requests_total")

			attrs := []attribute.KeyValue{
				attribute.String("method", c.Request().Method),
				attribute.String("route", c.Path()),
				attribute.String("status_code", strconv.Itoa(c.Response().Status)),
			}

			hist.Record(c.Request().Context(), durMs, metric.WithAttributes(attrs...))
			ctr.Add(c.Request().Context(), 1, metric.WithAttributes(attrs...))

			return err
		}
	}
}
