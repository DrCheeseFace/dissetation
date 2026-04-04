export interface MatrixMetadata {
  original_rows: number;
  original_cols: number;
  sampled_rows: number;
  sampled_cols: number;
}

export default interface MatrixInfo {
  columns: string[];
  data: (number | null)[][];
  metadata: MatrixMetadata;
}

export interface MatrixInfoAPIResponse {
  status: 'success' | 'error';
  info?: MatrixInfo;
  message: string;
}
