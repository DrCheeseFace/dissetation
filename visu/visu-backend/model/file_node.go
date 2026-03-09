package model

import "os"

type FileNode struct {
	Path       string
	File       *os.File
	Imputation Imputation
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
