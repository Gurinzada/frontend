import { Card, Divider } from "@mantine/core";
import { motion } from "framer-motion";
import { AnalysisResult } from "../types/analysis";
import { getScoreColor, getScoreLabel } from "../services/metricsCalculator";
import ScoreGauge from "./ScoreGauge";
import MetricCard from "./MetricCard";

interface ScoreDashboardProps {
  result: AnalysisResult;
}

export default function ScoreDashboard({ result }: ScoreDashboardProps) {
  const overallColor = getScoreColor(result.overallScore);
  const overallLabel = getScoreLabel(result.overallScore);

  const metrics = [
    result.documentation,
    result.taggedIssues,
    result.timeToFirstResponse,
    result.issueHealth,
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="row justify-content-center mt-4 pb-5"
    >
      <div className="col-12 col-md-10 col-lg-8 mb-4">
        <Card shadow="sm" padding="xl" radius="md" withBorder>
          <div className="d-flex flex-column align-items-center gap-3">
            <p
              className="text-muted mb-0"
              style={{
                fontSize: "0.85rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {result.repoFullName}
            </p>

            <ScoreGauge
              score={result.overallScore}
              size={180}
              textSize="32px"
            />

            <div className="text-center">
              <p
                className="fw-bold mb-1"
                style={{ fontSize: "1.3rem", color: overallColor }}
              >
                {overallLabel}
              </p>
              <p className="text-muted" style={{ fontSize: "0.85rem" }}>
                Score geral baseado em documentação, issues, tempo de resposta e
                saúde do repositório.
              </p>
            </div>

            <div className="d-flex flex-wrap justify-content-center gap-3">
              {metrics.map((m) => (
                <div key={m.title} className="d-flex align-items-center gap-1">
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: getScoreColor(m.score),
                      display: "inline-block",
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: "0.78rem", color: "#555" }}>
                    {m.title} ({Math.round(m.weight * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <Divider
        className="col-12 col-md-10 col-lg-8 mb-3"
        label="Métricas detalhadas"
        labelPosition="center"
      />

      <div className="col-12 col-md-10 col-lg-8">
        <div className="row g-3">
          {metrics.map((metric, i) => (
            <MetricCard key={metric.title} metric={metric} index={i} />
          ))}
        </div>
      </div>
    </motion.section>
  );
}
