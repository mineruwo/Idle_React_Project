// src/components/WarmthPieChart.jsx
import React from "react";
import { PieChart, Pie, Cell } from "recharts";
import "../../../../theme/CarOwner/warmpiechart.css";

const COLORS = ["#ffccdd", "#ff9999"]; // 정시 도착 / 지각

const WarmthPieChart = ({ onTime, late }) => {
  const total = onTime + late;
  const data = [
    { name: "정시 도착", value: onTime },
    { name: "지각", value: late },
  ];

  const warmth = total === 0 ? 0 : Math.round((onTime / total) * 100);

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
        {/* 중앙 텍스트는 PieChart 외부에서 절대 위치로 배치 */}
      </PieChart>
      <div className="center-text">
        <div className="score">{warmth}</div>
        <div className="label">점</div>
      </div>
    </div>
  );
};

export default WarmthPieChart;