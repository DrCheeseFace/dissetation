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
	"visu-backend/model"
)

type (
	ImputerService interface {
		// returns basic visualisation info json-string
		GetMissiGInfo() (string, error)

		// creates simpleimputation of "src" with "strategy" on "feature" saved to "dst"
		CreateSimpleImpute(
			dst string,
			strategy model.SimpleImputationStrategy,
			feature string,
		) error

		// returns ok if imputer_service returns ok
		GetHealth() error
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

	defer func() {
		_ = resp.Body.Close()
	}()

	if resp.StatusCode != http.StatusOK {
		logger.Log.Errorf("response was not 200. received %s %d", resp.Status, resp.StatusCode)
		return err
	}

	return nil
}

func (i *imputerSvc) GetMissiGInfo() (string, error) {
	f := i.fileSvc.GetParentFile()
	if f == nil {
		err := fmt.Errorf("parent file was not set")
		logger.Log.Warning(err)
		return "", err
	}

	type request struct {
		FilePath string `json:"file_path"`
	}

	r := request{FilePath: f.Path}

	jsonBytes, err := json.Marshal(r)
	if err != nil {
		return "", fmt.Errorf("failed to marshal request: %v", err)
	}

	req, err := http.NewRequest("GET", i.createUrl("get_missiG_info"), bytes.NewBuffer(jsonBytes))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("http request failed: %v", err)
	}

	defer func() {
		_ = resp.Body.Close()
	}()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read response body: %v", err)
	}

	return string(body), nil
}

func (i *imputerSvc) CreateSimpleImpute(
	dst string,
	strategy model.SimpleImputationStrategy,
	feature string) error {

	parentFile := i.fileSvc.GetParentFile()
	if parentFile == nil {
		err := fmt.Errorf("parent file was not set")
		logger.Log.Warning(err)
		return err
	}

	type request struct {
		Src      string                         `json:"src"`
		Dst      string                         `json:"dst"`
		Feature  string                         `json:"feature"`
		Strategy model.SimpleImputationStrategy `json:"strategy"`
	}

	r := request{Src: parentFile.Path, Dst: dst, Feature: feature, Strategy: strategy}

	jsonBytes, err := json.Marshal(r)
	if err != nil {
		return fmt.Errorf("failed to marshal request: %v", err)
	}

	req, err := http.NewRequest("POST", i.createUrl("simple_impute"), bytes.NewBuffer(jsonBytes))
	if err != nil {
		return fmt.Errorf("failed to create request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("http request failed: %v", err)
	}

	defer func() {
		_ = resp.Body.Close()
	}()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	_, err = i.fileSvc.CreateChildFile(
		dst,
		model.Imputation{Feature: feature, Method: r.Strategy.To_imputation_method()},
	)
	if err != nil {
		return fmt.Errorf("failed to create child file, %v", err)
	}

	return nil
}
