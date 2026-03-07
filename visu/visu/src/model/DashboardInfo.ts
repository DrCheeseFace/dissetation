export interface NumericHistogram {
  data_type: "numeric";
  counts: number[];
  bin_edges: number[];
}

export interface CategoricalHistogram {
  data_type: "categorical";
  counts: Record<string, number>;
}

export interface ColumnSummary {
  column_name: string;
  dtype: string;
  non_null_count: number;
  null_count: number;
  histogram: NumericHistogram | CategoricalHistogram | null;
}

export interface DatasetSummary {
  columns: ColumnSummary[];
  shape: [number, number];
}

export interface BasicInfoAPIResponse {
  status: "success" | "error";
  info: DatasetSummary;
  message: string;
}
