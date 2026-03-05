package service

import (
	"fmt"
	"net/http"
	"strings"

	"visu-backend/configuration"
	"visu-backend/logger"
)

type (
	ImputerService interface {
		GetHealth() error
	}

	imputerSvc struct{ baseUrl string }
)

func NewImputerService() ImputerService {
	cfg := configuration.State.ImputerConfig
	return imputerSvc{cfg.BaseUrl}
}

func (i imputerSvc) createUrl(args ...string) string {
	path := strings.Join(args, "/")
	return fmt.Sprintf("%s/%s", strings.TrimSuffix(i.baseUrl, "/"), strings.TrimPrefix(path, "/"))
}

func (i imputerSvc) GetHealth() error {
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
