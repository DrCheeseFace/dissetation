package handler

import (
	"net/http"
	"visu-backend/logger"
	"visu-backend/service"
)

type (
	FileHandler interface {
		// upload parent file
		UploadParentFile(w http.ResponseWriter, r *http.Request)
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
		logger.Log.Errorf("failed to close all files, %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	err = fH.fileSvc.SetParentFile(r)
	if err != nil {
		logger.Log.Errorf("failed to set parent file, %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
}
