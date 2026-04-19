export interface ComparisonMetrics {
  WD: number; // wassersteinm distance
  KS_STAT: number; // kolmogorov-smirnov test for goodness of fit
  VAR_RATIO: number; // varience ratio
  SKEW_DIFF: number; // skew difference 
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
