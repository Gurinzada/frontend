import { useState } from "react";
import { Card, Accordion, Badge, ThemeIcon } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import { motion } from "framer-motion";
import ScoreGauge from "./ScoreGauge";
import { MetricResult } from "../types/analysis";
import { getScoreColor } from "../services/metricsCalculator";

interface MetricCardProps {
  metric: MetricResult;
  index: number;
}

export default function MetricCard({ metric, index }: MetricCardProps) {
  const [open, setOpen] = useState(false);
  const color = getScoreColor(metric.score);
  const weightPct = Math.round(metric.weight * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
      className="col-12 col-sm-6 col-lg-3"
    >
      <Card
        shadow="sm"
        padding="md"
        radius="md"
        style={{ height: "100%", borderTop: `3px solid ${color}` }}
      >
        <div className="d-flex flex-column align-items-center gap-2">
          <ScoreGauge score={metric.score} size={90} textSize="26px" />

          <div className="text-center">
            <p className="fw-semibold mb-1" style={{ fontSize: "0.95rem" }}>
              {metric.title}
            </p>
            <Badge
              size="xs"
              color="gray"
              variant="light"
              style={{ marginBottom: 4 }}
            >
              Peso: {weightPct}%
            </Badge>
            <p
              className="text-muted"
              style={{ fontSize: "0.78rem", lineHeight: 1.4 }}
            >
              {metric.description}
            </p>
          </div>
        </div>

        <Accordion
          value={open ? "details" : null}
          onChange={(v) => setOpen(v === "details")}
          variant="filled"
          mt="sm"
        >
          <Accordion.Item value="details">
            <Accordion.Control
              style={{ padding: "6px 8px", fontSize: "0.8rem" }}
            >
              Ver detalhes
            </Accordion.Control>
            <Accordion.Panel>
              <div className="d-flex flex-column gap-1">
                {metric.checks.map((check, i) => (
                  <div
                    key={i}
                    className="d-flex align-items-start gap-2"
                    style={{ fontSize: "0.78rem" }}
                  >
                    <ThemeIcon
                      size={18}
                      radius="xl"
                      color={check.passed ? "green" : "red"}
                      variant="light"
                      style={{ flexShrink: 0, marginTop: 1 }}
                    >
                      {check.passed ? (
                        <IconCheck size={11} />
                      ) : (
                        <IconX size={11} />
                      )}
                    </ThemeIcon>
                    <span
                      style={{ color: check.passed ? "#2d9d6e" : "#c0392b" }}
                    >
                      {check.label}
                    </span>
                  </div>
                ))}
              </div>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Card>
    </motion.div>
  );
}
