package model

type BasicInfo struct {
	ColumnInfo []ColumnInfo `json:"columns"`
	Shape      [2]int       `json:"shape"`
}

type ColumnInfo struct {
	Index        int    `json:"index"`
	Name         string `json:"name"`
	Type         string `json:"dtype"`
	NonNullCount int    `json:"non_null_count"`
	NullCount    int    `json:"null_count"`
}
