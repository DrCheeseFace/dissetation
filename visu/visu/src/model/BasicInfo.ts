export interface ColumnInfo {
  index: number;
  name: string;
  dtype: string;
  non_null_count: number;
  null_count: number;
}

export interface BasicInfo {
  columns: ColumnInfo[];
  shape: [number, number];
}

export interface BasicInfoApiResponse {
  parent_file: BasicInfo;
  child_files: BasicInfo[];
}
