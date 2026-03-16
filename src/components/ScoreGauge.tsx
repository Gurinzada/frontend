import { useEffect, useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { getScoreColor } from "../services/metricsCalculator";

interface ScoreGaugeProps {
  score: number;
  size?: number;
  textSize?: string;
  animate?: boolean;
}

export default function ScoreGauge({
  score,
  size = 140,
  textSize = "24px",
  animate = true,
}: ScoreGaugeProps) {
  const [displayed, setDisplayed] = useState(animate ? 0 : score);

  useEffect(() => {
    if (!animate) {
      setDisplayed(score);
      return;
    }
    const timer = setTimeout(() => setDisplayed(score), 80);
    return () => clearTimeout(timer);
  }, [score, animate]);

  const color = getScoreColor(displayed);

  return (
    <div style={{ width: size, height: size }}>
      <CircularProgressbar
        value={displayed}
        maxValue={100}
        text={`${Math.round(displayed)}`}
        styles={buildStyles({
          pathColor: color,
          textColor: color,
          trailColor: "#e8e8e8",
          pathTransitionDuration: animate ? 1.4 : 0,
          textSize,
        })}
      />
    </div>
  );
}
