export interface ColumnInfo {
  index: number;
  name: string;
  dtype: string;
  non_null_count: number;
  null_count: number;
}

export type UUID = string;
export interface BasicInfo {
  imputations: Imputation[];
  uuid: UUID;
  filename: string;
  columns: ColumnInfo[];
  shape: [number, number];
}

export interface BasicInfoApiResponse {
  parent_file: BasicInfo;
  child_files: BasicInfo[];
}

export interface Imputation {
  feature: string;
  method: string;
}
