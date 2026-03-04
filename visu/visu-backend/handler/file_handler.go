package handler

import (
	"encoding/json"
	"net/http"
	"visu-backend/logger"
	"visu-backend/service"
)

type (
	FileHandler interface {

		// upload file
		UploadRootFile(w http.ResponseWriter, r *http.Request)

		// returns ok
		// TODO move this to another handler-service
		GetHealth(w http.ResponseWriter, r *http.Request)
	}

	fileHandler struct {
		fileSvc service.FileService
	}
)

func NewFileHandler(svc service.FileService) FileHandler {
	return fileHandler{svc}
}

func (fH fileHandler) UploadRootFile(w http.ResponseWriter, r *http.Request) {

	err := fH.fileSvc.CloseAllFiles()
	if err != nil {
		logger.Log.Errorf("failed to close all files, %w", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	err = fH.fileSvc.SetParentFile(r)
	if err != nil {
		logger.Log.Errorf("failed to set parent file, %w", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
}

func (fH fileHandler) GetHealth(w http.ResponseWriter, r *http.Request) {
	var response map[string]string

	if fH.fileSvc.GetHealth() == nil {
		response = map[string]string{"status": "healthy"}
		w.WriteHeader(http.StatusOK)
	} else {
		response = map[string]string{"status": "unhealthy"}
		w.WriteHeader(http.StatusInternalServerError)

	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
