package handler

import (
	"encoding/json"
	"net/http"
	"visu-backend/logger"
	"visu-backend/service"
)

type (
	ImputerHandler interface {
		// return parent imputer info dump. cached if needed
		GetParentFileInfo(w http.ResponseWriter, r *http.Request)

		// return healthy if impute service is healthy
		GetHealth(w http.ResponseWriter, r *http.Request)
	}

	imputerHandler struct {
		imputerSvc service.ImputerService
		fileSvc    service.FileService
	}
)

func NewImputerHandler(imputerSvc service.ImputerService, fileSvc service.FileService) ImputerHandler {
	return imputerHandler{imputerSvc, fileSvc}
}

func (i imputerHandler) GetParentFileInfo(w http.ResponseWriter, r *http.Request) {
	if !i.fileSvc.IsParentFileSet() {
		logger.Log.Warning("parent file was not set")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	body, err := i.imputerSvc.GetParentFileInfo()
	if err != nil {
		logger.Log.Errorf("failed to get parent file info")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte(body))

}

func (i imputerHandler) GetHealth(w http.ResponseWriter, r *http.Request) {
	var response map[string]string

	if i.imputerSvc.GetHealth() == nil {
		response = map[string]string{"status": "healthy"}
		w.WriteHeader(http.StatusOK)
	} else {
		response = map[string]string{"status": "unhealthy"}
		w.WriteHeader(http.StatusInternalServerError)

	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
