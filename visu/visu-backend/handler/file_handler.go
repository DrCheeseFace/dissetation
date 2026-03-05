package handler

import (
	"encoding/json"
	"net/http"
	"visu-backend/logger"
	"visu-backend/service"
)

type (
	FileHandler interface {

		// upload parent file
		UploadParentFile(w http.ResponseWriter, r *http.Request)

		// return parent file info dump. cached if needed
		GetParentFileInfo(w http.ResponseWriter, r *http.Request)

		// returns ok
		GetHealth(w http.ResponseWriter, r *http.Request)
	}

	fileHandler struct {
		fileSvc service.FileService
	}
)

func NewFileHandler(svc service.FileService) FileHandler {
	return fileHandler{svc}
}

func (fH fileHandler) UploadParentFile(w http.ResponseWriter, r *http.Request) {

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

func (fH fileHandler) GetParentFileInfo(w http.ResponseWriter, r *http.Request) {
	if !fH.fileSvc.IsParentFileSet() {
		logger.Log.Warning("parent file was not set")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

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
