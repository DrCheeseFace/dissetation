package configuration

import (
	"github.com/a8m/envsubst"
	"github.com/joho/godotenv"
	"gopkg.in/yaml.v3"
)

var State GeneralConfig

type (
	GeneralConfig struct {
		ServiceConfig ServiceConfig `yaml:"service"`
		ImputerConfig ImputerConfig `yaml:"imputer"`
	}

	ServiceConfig struct {
		Host string `yaml:"host"`
		Port string `yaml:"port"`
	}

	ImputerConfig struct {
		BaseUrl string `yaml:"base_url"`
	}
)

func Init() {
	err := godotenv.Load()
	if err != nil {
		panic(err)
	}
	bytes, err := envsubst.ReadFile("./config.yaml")
	if err != nil {
		panic(err)
	}

	err = yaml.Unmarshal(bytes, &State)
	if err != nil {
		panic(err)
	}
}
