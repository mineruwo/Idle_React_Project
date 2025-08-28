import React from "react";
import { PieChart, Pie, Cell } from "recharts";
import "../../../../theme/CarOwner/warmpiechart.css";

// 점수(%)와 남은 비율로 단순 도넛
const COLORS = ["#ffccdd", "#f0f0f0"]; // 점수 / 남은 영역

const WarmPieChart = ({ score }) => {
  // score가 null이면 차트는 빈 원형, 중앙엔 '—'만 표시
  const valid = typeof score === "number" && !Number.isNaN(score);
  const clamp = (v) => Math.max(0, Math.min(100, v));
  const s = valid ? clamp(Math.round(score)) : 0;

  const data = [
    { name: "score", value: s },
    { name: "rest", value: 100 - s },
  ];

  return (
    <div className="chart-wrapper">
      <PieChart width={200} height={200}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          dataKey="value"
          startAngle={90}
          endAngle={-270}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index]} />
          ))}
        </Pie>
      </PieChart>

      <div className="center-text">
        <div className="score">{valid ? s : "—"}</div>
        <div className="label">점</div>
      </div>
    </div>
  );
};

export default WarmPieChart;