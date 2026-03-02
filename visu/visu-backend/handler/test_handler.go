package handler

import (
	"encoding/json"
	"io"
	"net/http"
	"os"
	"path/filepath"

	"visu-backend/logger"
	"visu-backend/service"
)

type (
	TestHandler interface {

		// not included in /test route
		GetHealth(w http.ResponseWriter, r *http.Request)

		// test retrieving file
		UploadFile(w http.ResponseWriter, r *http.Request)
	}

	testHandler struct{ testSvc service.TestService }
)

func NewTestHandler(svc service.TestService) TestHandler {
	return testHandler{svc}
}

func (a testHandler) GetHealth(w http.ResponseWriter, r *http.Request) {
	var response map[string]string

	if a.testSvc.GetHealth() == nil {
		response = map[string]string{"status": "healthy"}
		w.WriteHeader(http.StatusOK)
	} else {
		response = map[string]string{"status": "unhealthy"}
		w.WriteHeader(http.StatusInternalServerError)

	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (a testHandler) UploadFile(w http.ResponseWriter, r *http.Request) {
	reader, err := r.MultipartReader()
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	for {
		part, err := reader.NextPart()
		if err == io.EOF {
			break
		}
		if err != nil {
			logger.Log.Errorf("failed to read next part of file")
			http.Error(w, "Error reading part", http.StatusInternalServerError)
			return
		}

		fp := filepath.Join("./uploads", part.FileName())
		dst, err := os.Create(fp)
		if err != nil {
			logger.Log.Errorf("failed to create file '%s' ", fp)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		defer dst.Close()

		if _, err := io.Copy(dst, part); err != nil {
			logger.Log.Errorf("failed to copy part '%s' to dest '%s' ", part.FileName(), fp)
			http.Error(w, "Error saving file", http.StatusInternalServerError)
			return
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "success"})
}
