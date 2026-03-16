package handler

import (
	"net/http"
	"visu-backend/logger"
	"visu-backend/service"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type (
	FileHandler interface {
		// upload parent file
		UploadParentFile(w http.ResponseWriter, r *http.Request)

		// delete child file
		DeleteChildFile(w http.ResponseWriter, r *http.Request)

		// promote child file to parent file
		PromoteChild(w http.ResponseWriter, r *http.Request)
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
	w.WriteHeader(http.StatusCreated)
}

func (fH fileHandler) DeleteChildFile(w http.ResponseWriter, r *http.Request) {
	uuidToDeleteStr := chi.URLParam(r, "uuid")

	if uuidToDeleteStr == "" {
		http.Error(w, "param 'uuid' is required", http.StatusBadRequest)
		return
	}

	uuidToDelete, err := uuid.Parse(uuidToDeleteStr)
	if err != nil {
		logger.Log.Warningf("invalid uuid provided, %v", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	err = fH.fileSvc.DeleteChildFile(uuidToDelete)
	if err != nil {
		logger.Log.Errorf("failed to delete child file of uuid %s, %v", uuidToDelete.String(), err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

// TODO IMPLEMENT
func (fH fileHandler) PromoteChild(w http.ResponseWriter, r *http.Request) {
	uuidToDeleteStr := chi.URLParam(r, "uuid")

	if uuidToDeleteStr == "" {
		http.Error(w, "param 'uuid' is required", http.StatusBadRequest)
		return
	}

	uuidToPromote, err := uuid.Parse(uuidToDeleteStr)
	if err != nil {
		logger.Log.Warningf("invalid uuid provided, %v", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	childFile := fH.fileSvc.GetChildFile(uuidToPromote)
	if childFile == nil {
		logger.Log.Warningf("no child file found with UUID %s", uuidToPromote)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	err = fH.fileSvc.PromoteChildFile(childFile.UUID)
	if err != nil {
		logger.Log.Warningf("failed to promote child file of UUID %s, %v", uuidToPromote, err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)
}
