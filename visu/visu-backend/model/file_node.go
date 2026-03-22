package model

import (
	"fmt"

	"github.com/google/uuid"
)

type FileNode struct {
	UUID        uuid.UUID
	Path        string
	Imputations []Imputation
}

type Imputation struct {
	Feature string           `json:"feature"` // TODO MAKE AN ARRAY FOR KNN
	Method  ImputationMethod `json:"method"`
}

type ImputationMethod string

func GetKNNImputationMethodTag(n_neighbors int) ImputationMethod {
	return ImputationMethod(fmt.Sprintf("knn_%d", n_neighbors))
}

const (
	ImputationMethodSimpleMean   ImputationMethod = "simple_mean"
	ImputationMethodSimpleMedian ImputationMethod = "simple_median"
	ImputationMethodSimpleMode   ImputationMethod = "simple_mode"
)
