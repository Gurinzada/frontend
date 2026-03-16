export interface CheckItem {
  label: string;
  passed: boolean;
}

export interface MetricResult {
  score: number;
  weight: number;
  title: string;
  description: string;
  checks: CheckItem[];
}

export interface AnalysisResult {
  documentation: MetricResult;
  taggedIssues: MetricResult;
  timeToFirstResponse: MetricResult;
  issueHealth: MetricResult;
  overallScore: number;
  repoFullName: string;
}
