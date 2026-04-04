package handler

import (
	"encoding/json"
	"net/http"
	"path/filepath"
	"strconv"
	"visu-backend/logger"
	"visu-backend/model"
	"visu-backend/service"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type (
	ImputerHandler interface {
		// return parent missiG info
		GetMissiGInfo(w http.ResponseWriter, r *http.Request)

		// creates simple impute child file
		PostSimpleImpute(w http.ResponseWriter, r *http.Request)

		// creates KNN impute child file
		PostKNNImpute(w http.ResponseWriter, r *http.Request)

		// get basic info on all file
		GetFilesInfo(w http.ResponseWriter, r *http.Request)

		// get basic info on old parent files
		GetParentHistory(w http.ResponseWriter, r *http.Request)

		// returns random sample of data of size n
		GetSample(w http.ResponseWriter, r *http.Request)

		// returns compare info
		GetCompareInfo(w http.ResponseWriter, r *http.Request)

		// returns values of rows
		GetRows(w http.ResponseWriter, r *http.Request)

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

func (i imputerHandler) GetMissiGInfo(w http.ResponseWriter, r *http.Request) {
	uuidParam := chi.URLParam(r, "uuid")
	if uuidParam == "" {
		http.Error(w, "param 'uuid' is required", http.StatusBadRequest)
		return
	}

	uuid, err := uuid.Parse(uuidParam)
	if err != nil {
		logger.Log.Warningf("invalid uuid provided, %v", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	f := i.fileSvc.GetFile(uuid)
	if f == nil {
		logger.Log.Warning("file of uuid %s does not exist", uuid.String())
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	body, err := i.imputerSvc.GetMissiGInfo(*f)
	if err != nil {
		logger.Log.Errorf("failed to get file MissiG info")
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

func (i imputerHandler) PostKNNImpute(w http.ResponseWriter, r *http.Request) {
	parentFile := i.fileSvc.GetParentFile()
	if parentFile == nil {
		logger.Log.Warning("parent file was not set")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	type KNNImputeRequest struct {
		Name      string `json:"name"`
		Neighbors int    `json:"n_neighbors"`
	}

	req := KNNImputeRequest{}
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

	err := i.imputerSvc.CreateKNNImpute(*parentFile, dst, req.Neighbors)
	if err != nil {
		logger.Log.Errorf("failed to create knn imputed file, %v", err)
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
	if err != nil {
		logger.Log.Errorf("failed to get parent file basic info, %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	basicInfo.Imputations = parentFile.Imputations

	response.ParentFile = *basicInfo

	childFiles := i.fileSvc.GetChildFiles()
	for _, childFile := range childFiles {
		basicInfo, err := i.imputerSvc.GetBasicInfo(childFile)
		if err != nil {
			logger.Log.Errorf("failed to get file %s basic info, %v", childFile.UUID, err)
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

func (i imputerHandler) GetParentHistory(w http.ResponseWriter, r *http.Request) {
	var response struct {
		ParentHistory []model.BasicInfo `json:"parent_history"`
	}

	history := i.fileSvc.GetParentFileHistory()
	for _, file := range history {
		basicInfo, err := i.imputerSvc.GetBasicInfo(file)
		if err != nil {
			logger.Log.Errorf("failed to get file %s basic info, %v", file.UUID, err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		basicInfo.Imputations = file.Imputations
		response.ParentHistory = append(response.ParentHistory, *basicInfo)

	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	_ = json.NewEncoder(w).Encode(response)
}

func (i imputerHandler) GetSample(w http.ResponseWriter, r *http.Request) {

	sampleSizeParam := chi.URLParam(r, "n")
	if sampleSizeParam == "" {
		http.Error(w, "param 'n' is required", http.StatusBadRequest)
		return
	}

	uuidToSampleParam := chi.URLParam(r, "uuid")
	if uuidToSampleParam == "" {
		http.Error(w, "param 'uuid' is required", http.StatusBadRequest)
		return
	}

	sampleSize, err := strconv.Atoi(sampleSizeParam)
	if err != nil {
		logger.Log.Errorf("invalid parameter n=%s given, %v", sampleSizeParam, err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	uuidToSample, err := uuid.Parse(uuidToSampleParam)
	if err != nil {
		logger.Log.Warningf("invalid uuid provided, %v", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	f := i.fileSvc.GetFile(uuidToSample)
	if f == nil {
		logger.Log.Warningf("file with uuid %s not found", uuidToSample.String())
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	sampleJSON, err := i.imputerSvc.GetSample(*f, sampleSize)
	if err != nil {
		logger.Log.Warningf(
			"failed to retrieve sample of size %d from file %s, %v",
			sampleSize,
			uuidToSample.String(),
			err,
		)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte(sampleJSON))
}

func (i imputerHandler) GetCompareInfo(w http.ResponseWriter, r *http.Request) {
	type ComparisonResponse struct {
		Root         map[string]model.ComparisonInfo `json:"root"`
		ChildToChild model.ComparisonInfo            `json:"childtochild"`
	}

	uuid1Param := chi.URLParam(r, "uuid1")
	if uuid1Param == "" {
		http.Error(w, "param 'uuid1' is required", http.StatusBadRequest)
		return
	}
	uuid2Param := chi.URLParam(r, "uuid2")
	if uuid1Param == "" {
		http.Error(w, "param 'uuid2' is required", http.StatusBadRequest)
		return
	}

	uuid1, err := uuid.Parse(uuid1Param)
	if err != nil {
		logger.Log.Warningf("invalid uuid provided, %v", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	uuid2, err := uuid.Parse(uuid2Param)
	if err != nil {
		logger.Log.Warningf("invalid uuid provided, %v", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	parentFile := i.fileSvc.GetParentFile()
	if parentFile == nil {
		logger.Log.Warning("parent file was not set")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	child1 := i.fileSvc.GetFile(uuid1)
	if child1 == nil {
		logger.Log.Warning("file of uuid %s does not exist", uuid1.String())
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	child2 := i.fileSvc.GetFile(uuid2)
	if child2 == nil {
		logger.Log.Warning("file of uuid %s does not exist", uuid2.String())
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	// CHILD1 TO CHILD2
	compareInfoC1C2, err := i.imputerSvc.GetCompareInfo(*child1, *child2)
	if err != nil {
		logger.Log.Errorf(
			"failed to retrieve compare info between %s and %s, %v",
			child1.UUID.String(),
			child2.UUID.String(),
			err,
		)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	// PARENT TO CHILD1
	compareInfoPC1, err := i.imputerSvc.GetCompareInfo(*parentFile, *child1)
	if err != nil {
		logger.Log.Errorf(
			"failed to retrieve compare info between %s and %s, %v",
			parentFile.UUID.String(),
			child1.UUID.String(),
			err,
		)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	// PARENT TO CHILD2
	compareInfoPC2, err := i.imputerSvc.GetCompareInfo(*parentFile, *child2)
	if err != nil {
		logger.Log.Errorf(
			"failed to retrieve compare info between %s and %s, %v",
			parentFile.UUID.String(),
			child2.UUID.String(),
			err,
		)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	response := ComparisonResponse{
		Root: map[string]model.ComparisonInfo{
			child1.UUID.String(): *compareInfoPC1,
			child2.UUID.String(): *compareInfoPC2,
		},
		ChildToChild: *compareInfoC1C2,
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(response)
}

func (i imputerHandler) GetRows(w http.ResponseWriter, r *http.Request) {
	type RowRequest struct {
		Rows []int `json:"row_indexes"`
	}

	req := RowRequest{}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	uuidParam := chi.URLParam(r, "uuid")
	if uuidParam == "" {
		http.Error(w, "param 'uuid' is required", http.StatusBadRequest)
		return
	}

	uuid, err := uuid.Parse(uuidParam)
	if err != nil {
		logger.Log.Warningf("invalid uuid provided, %v", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	f := i.fileSvc.GetFile(uuid)
	if f == nil {
		logger.Log.Warning("file of uuid %s does not exist", uuid.String())
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	body, err := i.imputerSvc.GetRows(*f, req.Rows)
	if err != nil {
		logger.Log.Errorf("failed to retrieve rows for file %s, %v", uuid.String(), err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte(body))

}
