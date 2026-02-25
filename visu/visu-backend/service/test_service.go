package service

type (
	TestService interface {
		GetHealth() error
	}

	testSvc struct{}
)

func NewTestService() TestService {
	return testSvc{}
}

func (tS testSvc) GetHealth() error {
	return nil
}
