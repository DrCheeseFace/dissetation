export interface ColumnSummary {
  column_name: string;
  dtype: string;
  non_null_count: number;
  null_count: number;
}

export interface DatasetSummary {
  columns: ColumnSummary[];
  shape: [number, number];
}

export interface BasicInfoAPIResponse {
  status: "success" | "error";
  info: DatasetSummary;
  message: "success" | "error";
}
