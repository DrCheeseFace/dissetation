package model

import (
	"os"

	"github.com/google/uuid"
)

type FileNode struct {
	UUID       uuid.UUID
	Path       string
	File       *os.File
	Imputation Imputation // TODO make this an arr
}

type Imputation struct {
	Feature string
	Method  ImputationMethod
}

type ImputationMethod string

const (
	ImputationMethodSimpleMean   ImputationMethod = "simple_mean"
	ImputationMethodSimpleMedian ImputationMethod = "simple_median"
	ImputationMethodSimpleMode   ImputationMethod = "simple_mode"
)
