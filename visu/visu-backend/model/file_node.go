package model

import (
	"os"

	"github.com/google/uuid"
)

type FileNode struct {
	UUID        uuid.UUID
	Path        string
	File        *os.File
	Imputations []Imputation
}

type Imputation struct {
	Feature string           `json:"feature"`
	Method  ImputationMethod `json:"method"`
}

type ImputationMethod string

const (
	ImputationMethodSimpleMean   ImputationMethod = "simple_mean"
	ImputationMethodSimpleMedian ImputationMethod = "simple_median"
	ImputationMethodSimpleMode   ImputationMethod = "simple_mode"
)
