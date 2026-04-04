package service

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"path/filepath"
	"strings"

	"visu-backend/configuration"
	"visu-backend/logger"
	"visu-backend/model"
)

type (
	ImputerService interface {
		// returns MissiG visualisation info json-string
		GetMissiGInfo(model.FileNode) (string, error)

		// creates simple imputation of "src" with "strategy" on "feature" saved to "dst"
		CreateSimpleImpute(
			src model.FileNode,
			dst string,
			strategy model.SimpleImputationStrategy,
			feature string,
		) error

		// creates KNN imputation of "src" with  "n_neighbors" saved to "dst"
		CreateKNNImpute(
			src model.FileNode,
			dst string,
			n_neighbors int,
		) error

		// returns basic info json-string
		GetBasicInfo(model.FileNode) (*model.BasicInfo, error)

		// returns basic info json-string
		GetSample(src model.FileNode, sampleSize int) (string, error)

		// return values of given row indexes
		GetRows(src model.FileNode, rowIndexes []int) (string, error)

		// returns ok if imputer_service returns ok
		GetCompareInfo(base model.FileNode, child model.FileNode) (*model.ComparisonInfo, error)

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

func (i *imputerSvc) GetMissiGInfo(f model.FileNode) (string, error) {
	params := url.Values{}
	params.Add("file_path", f.Path)
	fullUrl := fmt.Sprintf("%s?%s", i.createUrl("missiG_info"), params.Encode())

	req, err := http.NewRequest("GET", fullUrl, nil)
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

func (i imputerSvc) GetBasicInfo(f model.FileNode) (*model.BasicInfo, error) {
	params := url.Values{}
	params.Add("file_path", f.Path)
	fullUrl := fmt.Sprintf("%s?%s", i.createUrl("basic_info"), params.Encode())

	req, err := http.NewRequest("GET", fullUrl, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("http request failed: %v", err)
	}

	defer func() {
		_ = resp.Body.Close()
	}()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %v", err)
	}

	var basicInfo model.BasicInfo
	err = json.Unmarshal(body, &basicInfo)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal basic info: %v", err)
	}

	basicInfo.Filename = filepath.Base(f.Path)
	basicInfo.UUID = f.UUID

	return &basicInfo, nil
}

func (i *imputerSvc) CreateSimpleImpute(
	src model.FileNode,
	dst string,
	strategy model.SimpleImputationStrategy,
	feature string) error {

	type request struct {
		Src      string                         `json:"src"`
		Dst      string                         `json:"dst"`
		Feature  string                         `json:"feature"`
		Strategy model.SimpleImputationStrategy `json:"strategy"`
	}

	r := request{Src: src.Path, Dst: dst, Feature: feature, Strategy: strategy}

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

	var imputations = src.Imputations
	imputations = append(
		imputations,
		model.Imputation{
			Feature: feature,
			Method:  r.Strategy.To_imputation_method(),
		},
	)

	_, err = i.fileSvc.CreateChildFile(dst, imputations)
	if err != nil {
		return fmt.Errorf("failed to create child file, %v", err)
	}

	return nil
}

func (i *imputerSvc) CreateKNNImpute(src model.FileNode, dst string, n_neighbors int) error {
	type request struct {
		Src       string `json:"src"`
		Dst       string `json:"dst"`
		Neighbors int    `json:"n_neighbors"`
	}

	r := request{Src: src.Path, Dst: dst, Neighbors: n_neighbors}

	jsonBytes, err := json.Marshal(r)
	if err != nil {
		return fmt.Errorf("failed to marshal request: %v", err)
	}

	req, err := http.NewRequest("POST", i.createUrl("knn_impute"), bytes.NewBuffer(jsonBytes))
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
		bytes, _ := io.ReadAll(resp.Body)
		logger.Log.Debugf("%v", string(bytes))
		return fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	var imputations = src.Imputations
	imputations = append(
		imputations,
		// TODO CHANGE FEATURE TO ARRAY LATER FOR KNN IMPUTER
		model.Imputation{
			Feature: "ALL",
			Method:  model.GetKNNImputationMethodTag(n_neighbors),
		},
	)

	_, err = i.fileSvc.CreateChildFile(dst, imputations)
	if err != nil {
		return fmt.Errorf("failed to create child file, %v", err)
	}

	return nil
}

func (i *imputerSvc) GetSample(src model.FileNode, sampleSize int) (string, error) {
	params := url.Values{}
	params.Add("src", src.Path)
	params.Add("n", fmt.Sprint(sampleSize))
	fullUrl := fmt.Sprintf("%s?%s", i.createUrl("sample"), params.Encode())

	req, err := http.NewRequest("GET", fullUrl, nil)
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
		bytes, _ := io.ReadAll(resp.Body)
		logger.Log.Debugf("%v", string(bytes))
		return "", fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	bytes, err := io.ReadAll(resp.Body)
	return string(bytes), err
}

func (i *imputerSvc) GetRows(src model.FileNode, rowIndexes []int) (string, error) {
	type request struct {
		Src  string `json:"src"`
		Rows []int  `json:"row_indexes"`
	}

	r := request{Src: src.Path, Rows: rowIndexes}

	jsonBytes, err := json.Marshal(r)
	if err != nil {
		return "", fmt.Errorf("failed to marshal request: %v", err)
	}

	req, err := http.NewRequest("POST", i.createUrl("rows"), bytes.NewBuffer(jsonBytes))
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
		bytes, _ := io.ReadAll(resp.Body)
		logger.Log.Debugf("%v", string(bytes))
		return "", fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read response body: %v", err)
	}

	return string(body), nil
}

func (i *imputerSvc) GetCompareInfo(
	base model.FileNode,
	child model.FileNode,
) (*model.ComparisonInfo, error) {
	params := url.Values{}
	params.Add("base", base.Path)
	params.Add("child", child.Path)
	fullUrl := fmt.Sprintf("%s?%s", i.createUrl("compare"), params.Encode())

	req, err := http.NewRequest("GET", fullUrl, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("http request failed: %v", err)
	}

	defer func() {
		_ = resp.Body.Close()
	}()

	if resp.StatusCode != http.StatusOK {
		bytes, _ := io.ReadAll(resp.Body)
		logger.Log.Debugf("%v", string(bytes))
		return nil, fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	var response model.ComparisonInfo
	bytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %v", err)
	}

	err = json.Unmarshal(bytes, &response)

	return &response, err
}
