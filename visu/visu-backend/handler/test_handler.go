package handler

import (
	"encoding/json"
	"net/http"
	"visu-backend/service"
)

type (
	TestHandler interface {
		GetHealth(w http.ResponseWriter, r *http.Request)
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
