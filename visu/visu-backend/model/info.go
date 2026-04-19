package model

import "github.com/google/uuid"

type BasicInfo struct {
	UUID        uuid.UUID    `json:"uuid"`
	Filename    string       `json:"filename"`
	ColumnInfo  []ColumnInfo `json:"columns"`
	Shape       [2]int       `json:"shape"`
	Imputations []Imputation `json:"imputations"`
}

type ColumnInfo struct {
	Index        int    `json:"index"`
	Name         string `json:"name"`
	Type         string `json:"dtype"`
	NonNullCount int    `json:"non_null_count"`
	NullCount    int    `json:"null_count"`
}

type ComparisonInfo []ColumnComparisonMetrics
type ColumnComparisonMetrics map[string]ComparisonMetrics
type ComparisonMetrics struct {
	WD        float64 `json:"WD"` // wasserstein distance
	KS_Stat   float64 `json:"KS_STAT"`
	VAR_RATIO float64 `json:"VAR_RATIO"`
	SKEW_DIFF float64 `json:"SKEW_DIFF"`
}
