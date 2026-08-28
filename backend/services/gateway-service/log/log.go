package log

import (
	"fmt"
	"log"
	"os"
	"time"
)

type Logger struct {
	infoLogger  *log.Logger
	warnLogger  *log.Logger
	errorLogger *log.Logger
}

var globalLogger *Logger

func init() {
	globalLogger = &Logger{
		infoLogger:  log.New(os.Stdout, "\033[34m[INFO]\033[0m ", 0),
		warnLogger:  log.New(os.Stdout, "\033[33m[WARN]\033[0m ", 0),
		errorLogger: log.New(os.Stderr, "\033[31m[ERROR]\033[0m ", 0),
	}
}

func formatMessage(corrID, msg string) string {
	ts := time.Now().UTC().Format("2006-01-02 15:04:05")
	if corrID != "" {
		return fmt.Sprintf("[%s] [%s] %s", ts, corrID, msg)
	}
	return fmt.Sprintf("[%s] %s", ts, msg)
}

func Info(corrID, format string, v ...interface{}) {
	msg := fmt.Sprintf(format, v...)
	globalLogger.infoLogger.Println(formatMessage(corrID, msg))
}

func Warn(corrID, format string, v ...interface{}) {
	msg := fmt.Sprintf(format, v...)
	globalLogger.warnLogger.Println(formatMessage(corrID, msg))
}

func Error(corrID, format string, v ...interface{}) {
	msg := fmt.Sprintf(format, v...)
	globalLogger.errorLogger.Println(formatMessage(corrID, msg))
}

func Fatal(format string, v ...interface{}) {
	msg := fmt.Sprintf(format, v...)
	log.Fatalf("\033[31m[FATAL]\033[0m %s", msg)
}
