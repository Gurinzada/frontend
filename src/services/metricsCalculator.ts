import {
  GitHubComment,
  GitHubContent,
  GitHubIssue,
  GitHubOrganizedComments,
  GitHubRawIssue,
} from "../types/gitHub";
import { AnalysisResult, CheckItem, MetricResult } from "../types/analysis";

export interface AnalysisInput {
  readme: string | null;
  contributing: boolean;
  contents: GitHubContent[];
  taggedIssues: GitHubIssue;
  allIssues: GitHubRawIssue[];
  totalOpenIssues: number;
  comments: GitHubComment[];
  organizedComments: GitHubOrganizedComments[];
  repoFullName: string;
}

function calcDocumentation(
  readme: string | null,
  hasContributing: boolean,
): MetricResult {
  const checks: CheckItem[] = [];
  let score = 0;

  const readmeExists = readme !== null;
  checks.push({ label: "README.md presente", passed: readmeExists });
  if (readmeExists) score += 20;

  if (readme) {
    const r = readme.toLowerCase();

    const hasInstall = /install|getting started|configuração|instalação/.test(
      r,
    );
    checks.push({
      label: "README contém instruções de instalação",
      passed: hasInstall,
    });
    if (hasInstall) score += 15;

    const hasUsage = /usage|uso|como usar|how to use|exemplos|examples/.test(r);
    checks.push({ label: "README contém seção de uso", passed: hasUsage });
    if (hasUsage) score += 15;

    const hasContrib = /contribut|contribuição|contribuindo|contributing/.test(
      r,
    );
    checks.push({
      label: "README menciona como contribuir",
      passed: hasContrib,
    });
    if (hasContrib) score += 10;

    const hasLicense = /licen[cs]/.test(r);
    checks.push({ label: "README menciona licença", passed: hasLicense });
    if (hasLicense) score += 10;
  }

  checks.push({
    label: "CONTRIBUTING.md presente",
    passed: hasContributing,
  });
  if (hasContributing) score += 30;

  return {
    score: Math.min(score, 100),
    weight: 0.3,
    title: "Documentação",
    description:
      "Avalia a presença e qualidade da documentação do projeto para novos contribuidores.",
    checks,
  };
}

function calcTaggedIssues(
  taggedCount: number,
  totalCount: number,
): MetricResult {
  const checks: CheckItem[] = [];

  checks.push({
    label: "Possui issues marcadas para iniciantes",
    passed: taggedCount > 0,
  });

  const pct = totalCount > 0 ? (taggedCount / totalCount) * 100 : 0;
  checks.push({
    label: `Ao menos 5% das issues são para iniciantes (atual: ${pct.toFixed(1)}%)`,
    passed: pct >= 5,
  });
  checks.push({
    label: `Ao menos 10% das issues são para iniciantes`,
    passed: pct >= 10,
  });
  checks.push({
    label: `Ao menos 20% das issues são para iniciantes`,
    passed: pct >= 20,
  });

  let score = 0;
  if (totalCount === 0 || taggedCount === 0) {
    score = 0;
  } else if (pct >= 20) {
    score = 100;
  } else if (pct >= 10) {
    score = 80;
  } else if (pct >= 5) {
    score = 60;
  } else {
    score = 40;
  }

  const desc =
    totalCount === 0
      ? "Sem issues abertas no repositório."
      : `${taggedCount} de ${totalCount} issues abertas têm labels para iniciantes (${pct.toFixed(1)}%).`;

  return {
    score,
    weight: 0.25,
    title: "Issues para Iniciantes",
    description: desc,
    checks,
  };
}

function calcTimeToFirstResponse(
  organizedComments: GitHubOrganizedComments[],
  taggedIssueItems: GitHubIssue["items"],
): MetricResult {
  const checks: CheckItem[] = [];

  const issuesWithResponse = organizedComments.filter(
    (oc) => oc.comments.length > 0,
  );
  checks.push({
    label: "Issues analisadas recebem respostas",
    passed: issuesWithResponse.length > 0,
  });

  if (issuesWithResponse.length === 0) {
    return {
      score: 0,
      weight: 0.25,
      title: "Tempo de Resposta",
      description: "Nenhuma resposta encontrada nas issues analisadas.",
      checks,
    };
  }

  const responseTimes: number[] = [];
  for (const oc of issuesWithResponse) {
    const issue = taggedIssueItems.find((i) => i.number === oc.id);
    if (!issue) continue;
    const issueCreated = new Date(issue.created_at).getTime();
    const firstComment = new Date(oc.comments[0].created_at).getTime();
    const hours = (firstComment - issueCreated) / (1000 * 60 * 60);
    if (hours >= 0) responseTimes.push(hours);
  }

  if (responseTimes.length === 0) {
    return {
      score: 0,
      weight: 0.25,
      title: "Tempo de Resposta",
      description: "Dados insuficientes para calcular tempo de resposta.",
      checks,
    };
  }

  const avgHours =
    responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
  const avgDays = avgHours / 24;

  checks.push({
    label: "Resposta média em menos de 1 dia",
    passed: avgDays < 1,
  });
  checks.push({
    label: "Resposta média em menos de 3 dias",
    passed: avgDays < 3,
  });
  checks.push({
    label: "Resposta média em menos de 7 dias",
    passed: avgDays < 7,
  });

  let score = 0;
  if (avgDays < 1) score = 100;
  else if (avgDays < 3) score = 80;
  else if (avgDays < 7) score = 60;
  else if (avgDays < 14) score = 40;
  else score = 20;

  const display =
    avgDays < 1 ? `${Math.round(avgHours)}h` : `${avgDays.toFixed(1)} dias`;

  return {
    score,
    weight: 0.25,
    title: "Tempo de Resposta",
    description: `Tempo médio de primeira resposta: ${display} (baseado em ${responseTimes.length} issue${responseTimes.length > 1 ? "s" : ""}).`,
    checks,
  };
}

function calcIssueHealth(allIssues: GitHubRawIssue[]): MetricResult {
  const checks: CheckItem[] = [];

  if (allIssues.length === 0) {
    checks.push({ label: "Repositório tem issues abertas", passed: false });
    return {
      score: 0,
      weight: 0.2,
      title: "Saúde das Issues",
      description: "Nenhuma issue aberta encontrada.",
      checks,
    };
  }

  checks.push({ label: "Repositório tem issues abertas", passed: true });

  const now = Date.now();

  const avgDaysOpen =
    allIssues.reduce((sum, issue) => {
      return (
        sum +
        (now - new Date(issue.created_at).getTime()) / (1000 * 60 * 60 * 24)
      );
    }, 0) / allIssues.length;

  const issuesWithComments = allIssues.filter((i) => i.comments > 0).length;
  const commentRate = issuesWithComments / allIssues.length;

  const issuesWithLabels = allIssues.filter((i) => i.labels.length > 0).length;
  const labelRate = issuesWithLabels / allIssues.length;

  checks.push({
    label: `Idade média das issues menor que 90 dias (atual: ${avgDaysOpen.toFixed(0)} dias)`,
    passed: avgDaysOpen < 90,
  });
  checks.push({
    label: `Mais de 50% das issues têm comentários (atual: ${(commentRate * 100).toFixed(0)}%)`,
    passed: commentRate > 0.5,
  });
  checks.push({
    label: `Mais de 30% das issues têm labels (atual: ${(labelRate * 100).toFixed(0)}%)`,
    passed: labelRate > 0.3,
  });

  let score = 0;

  if (avgDaysOpen < 30) score += 40;
  else if (avgDaysOpen < 60) score += 30;
  else if (avgDaysOpen < 90) score += 20;
  else if (avgDaysOpen < 180) score += 10;

  if (commentRate >= 0.7) score += 30;
  else if (commentRate > 0.5) score += 20;
  else if (commentRate > 0.3) score += 10;

  if (labelRate >= 0.7) score += 30;
  else if (labelRate > 0.5) score += 20;
  else if (labelRate > 0.3) score += 10;

  console.log(score)
  return {
    score: Math.min(score, 100),
    weight: 0.2,
    title: "Saúde das Issues",
    description: `${allIssues.length} issues abertas — ${(commentRate * 100).toFixed(0)}% comentadas, idade média ${avgDaysOpen.toFixed(0)} dias.`,
    checks,
  };
}

export function computeAnalysis(input: AnalysisInput): AnalysisResult {
  const documentation = calcDocumentation(input.readme, input.contributing);
  const taggedIssues = calcTaggedIssues(
    input.taggedIssues.total_count,
    input.totalOpenIssues,
  );
  const timeToFirstResponse = calcTimeToFirstResponse(
    input.organizedComments,
    input.taggedIssues.items,
  );
  const issueHealth = calcIssueHealth(input.allIssues);

  const overallScore = Math.round(
    documentation.score * documentation.weight +
      taggedIssues.score * taggedIssues.weight +
      timeToFirstResponse.score * timeToFirstResponse.weight +
      issueHealth.score * issueHealth.weight,
  );

  return {
    documentation,
    taggedIssues,
    timeToFirstResponse,
    issueHealth,
    overallScore,
    repoFullName: input.repoFullName,
  };
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return "Excelente para iniciantes";
  if (score >= 70) return "Bom para iniciantes";
  if (score >= 50) return "Adequado para iniciantes";
  if (score >= 30) return "Pouco amigável para iniciantes";
  return "Não recomendado para iniciantes";
}

export function getScoreColor(score: number): string {
  if (score >= 90) return "#0CCE6B";
  if (score >= 50) return "#FFA400";
  return "#FF4E42";
}
