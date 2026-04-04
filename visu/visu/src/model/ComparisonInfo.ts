export interface ComparisonMetrics {
  WD: number; // wassersteinm distance
  MAD: number; // mean absolute difference
}

export interface ColumnComparisonMetrics {
  [columnName: string]: ComparisonMetrics;
}

export type ComparisonInfo = ColumnComparisonMetrics[];

export interface ComparisonResponse {
  root: {
    [uuid: string]: ComparisonInfo;
  };
  childtochild: ComparisonInfo;
}
