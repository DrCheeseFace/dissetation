package handler

import (
	"encoding/json"
	"net/http"
	"path/filepath"
	"visu-backend/logger"
	"visu-backend/model"
	"visu-backend/service"
)

type (
	ImputerHandler interface {
		// return parent missiG info
		GetParentFileMissiGInfo(w http.ResponseWriter, r *http.Request)

		// creates simple impute child file
		PostSimpleImpute(w http.ResponseWriter, r *http.Request)

		// get basic info on all file
		GetFilesInfo(w http.ResponseWriter, r *http.Request)

		// return healthy if impute service is healthy
		GetHealth(w http.ResponseWriter, r *http.Request)
	}

	imputerHandler struct {
		imputerSvc service.ImputerService
		fileSvc    service.FileService
	}
)

func NewImputerHandler(
	imputerSvc service.ImputerService,
	fileSvc service.FileService,
) ImputerHandler {
	return imputerHandler{imputerSvc, fileSvc}
}

func (i imputerHandler) GetParentFileMissiGInfo(w http.ResponseWriter, r *http.Request) {
	f := i.fileSvc.GetParentFile()
	if f == nil {
		logger.Log.Warning("parent file was not set")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	body, err := i.imputerSvc.GetMissiGInfo(*f)
	if err != nil {
		logger.Log.Errorf("failed to get parent file MissiG info")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte(body))

}

func (i imputerHandler) PostSimpleImpute(w http.ResponseWriter, r *http.Request) {
	parentFile := i.fileSvc.GetParentFile()
	if parentFile == nil {
		logger.Log.Warning("parent file was not set")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	type SimpleImputeRequest struct {
		Name     string                         `json:"name"`
		Strategy model.SimpleImputationStrategy `json:"strategy"`
		Feature  string                         `json:"feature"`
	}

	req := SimpleImputeRequest{}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	dst := filepath.Join("./uploads", req.Name)

	for _, c := range i.fileSvc.GetChildFiles() {
		if c.Path == dst {
			logger.Log.Warningf("child file of name %s already exists", req.Name)
			w.WriteHeader(http.StatusBadRequest)
			return
		}
	}

	err := i.imputerSvc.CreateSimpleImpute(*parentFile, dst, req.Strategy, req.Feature)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusCreated)
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
	_ = json.NewEncoder(w).Encode(response)
}

func (i imputerHandler) GetFilesInfo(w http.ResponseWriter, r *http.Request) {
	var response struct {
		ParentFile model.BasicInfo   `json:"parent_file"`
		ChildFiles []model.BasicInfo `json:"child_files"`
	}

	parentFile := i.fileSvc.GetParentFile()
	if parentFile == nil {
		logger.Log.Warning("parent file was not set")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	basicInfo, err := i.imputerSvc.GetBasicInfo(*parentFile)
	basicInfo.Imputations = parentFile.Imputations
	if err != nil {
		logger.Log.Errorf("failed to get parent file basic info, %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	response.ParentFile = *basicInfo

	childFiles := i.fileSvc.GetChildFiles()
	for _, childFile := range childFiles {
		basicInfo, err := i.imputerSvc.GetBasicInfo(childFile)
		if err != nil {
			logger.Log.Errorf("failed to get child file basic info")
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		basicInfo.Imputations = childFile.Imputations
		response.ChildFiles = append(response.ChildFiles, *basicInfo)

	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	_ = json.NewEncoder(w).Encode(response)
}
