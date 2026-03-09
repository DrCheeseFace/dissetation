package model

type SimpleImputationStrategy string

const (
	SimpleImputationMean   SimpleImputationStrategy = "mean"
	SimpleImputationMedian SimpleImputationStrategy = "median"
	SimpleImputationMode   SimpleImputationStrategy = "mode"
)

func (s SimpleImputationStrategy) To_imputation_method() ImputationMethod {
	switch s {
	case SimpleImputationMean:
		return ImputationMethodSimpleMean
	case SimpleImputationMedian:
		return ImputationMethodSimpleMedian
	case SimpleImputationMode:
		return ImputationMethodSimpleMode
	default:
		return ""
	}
}
