package logger

import (
	"os"

	"github.com/op/go-logging"
)

var Log = logging.MustGetLogger("mahjonger")

var format = logging.MustStringFormatter(
	`%{color}%{time:15:04:05.000} %{shortfile} %{shortfunc} ▶ %{level:.4s} %{id:03x}%{color:reset} %{message}`,
)

var jsonFormat = logging.MustStringFormatter(
	`{"level":"%{level}","time":"%{time:15:04:05.000}","id":"%{id:03x}","message":"%{message}","func":"%{longfunc}"}`,
)

func Init() error {
	logFile, err := os.OpenFile("./logger/logs/go-server.log", os.O_WRONLY|os.O_CREATE|os.O_APPEND, 0660)
	if err != nil {
		return err
	}

	jsonLogger := logging.NewLogBackend(logFile, "", 0)
	debugLogger := logging.NewLogBackend(os.Stderr, "", 0)

	debugFormatter := logging.NewBackendFormatter(debugLogger, format)
	jsonFormatter := logging.NewBackendFormatter(jsonLogger, jsonFormat)

	logging.SetBackend(debugFormatter, jsonFormatter)

	return nil
}
