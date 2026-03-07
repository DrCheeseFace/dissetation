export interface NumericHistogram {
  data_type: "numeric";
  counts: number[];
  bin_edges: number[];
}

export interface CategoricalHistogram {
  data_type: "categorical";
  counts: Record<string, number>;
}

export interface JointMissingnessHistogram {
  target_column: string;
  data_type: "numeric" | "categorical";
  counts: number[] | Record<string, number>;
  bin_edges?: number[];
}

export interface ColumnSummary {
  column_name: string;
  dtype: string;
  non_null_count: number;
  null_count: number;
  joint_missingness: number[];
  joint_missingness_histograms: JointMissingnessHistogram[];
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
