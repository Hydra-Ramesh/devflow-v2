package logger

import (
	"context"
	"fmt"
	"log"
)

// Info logs a message with the correlation ID from the context if it exists.
func Info(ctx context.Context, format string, v ...interface{}) {
	msg := fmt.Sprintf(format, v...)
	logWithContext(ctx, "INFO", msg)
}

// Error logs an error message with the correlation ID from the context.
func Error(ctx context.Context, format string, v ...interface{}) {
	msg := fmt.Sprintf(format, v...)
	logWithContext(ctx, "ERROR", msg)
}

// Warn logs a warning message with the correlation ID from the context.
func Warn(ctx context.Context, format string, v ...interface{}) {
	msg := fmt.Sprintf(format, v...)
	logWithContext(ctx, "WARN", msg)
}

func logWithContext(ctx context.Context, level, msg string) {
	var traceId string
	if ctx != nil {
		if val := ctx.Value("correlation_id"); val != nil {
			traceId = val.(string)
		}
	}
	if traceId == "" {
		traceId = "NO-TRACE"
	}
	log.Printf("[Trace: %s] [%s] %s\n", traceId, level, msg)
}
