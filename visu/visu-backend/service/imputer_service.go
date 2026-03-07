package service

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"visu-backend/configuration"
	"visu-backend/logger"
)

type (
	ImputerService interface {
		GetHealth() error
		GetParentFileInfo() (string, error)
	}

	imputerSvc struct {
		baseUrl string
		fileSvc FileService
	}
)

func NewImputerService(fileSvc FileService) ImputerService {
	cfg := configuration.State.ImputerConfig
	return &imputerSvc{cfg.BaseUrl, fileSvc}
}

func (i *imputerSvc) createUrl(args ...string) string {
	path := strings.Join(args, "/")
	return fmt.Sprintf("%s/%s", strings.TrimSuffix(i.baseUrl, "/"), strings.TrimPrefix(path, "/"))
}

func (i *imputerSvc) GetHealth() error {
	resp, err := http.Get(i.createUrl("health"))
	if err != nil {
		logger.Log.Errorf("unable to make health get request %v", err)
		return err
	}

	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		logger.Log.Errorf("response was not 200. received %s %d", resp.Status, resp.StatusCode)
		return err
	}

	return nil
}

func (i *imputerSvc) GetParentFileInfo() (string, error) {
	f := i.fileSvc.GetParentFile()
	if f == nil {
		err := fmt.Errorf("parent file was not set")
		logger.Log.Warning(err)
		return "", err
	}

	type request struct {
		FilePath string `json:"file_path"`
	}

	r := request{FilePath: f.Name()}

	jsonBytes, err := json.Marshal(r)
	if err != nil {
		return "", fmt.Errorf("failed to marshal request: %v", err)
	}

	req, err := http.NewRequest("GET", i.createUrl("summary"), bytes.NewBuffer(jsonBytes))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("http request failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read response body: %v", err)
	}

	return string(body), nil
}
