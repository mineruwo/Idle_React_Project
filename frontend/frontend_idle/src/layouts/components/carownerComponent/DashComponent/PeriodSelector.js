import React from "react";

const PeriodSelector = ({ value, onChange, options = "default" }) => {
  // options: "default" -> month/week/last7, "chart" -> month/week/last7
  const defaultOptions = [
    { v: "month", label: "이번 달" },
    { v: "week", label: "이번 주" },
    { v: "last7", label: "최근 7일" },
  ];

  const list = defaultOptions;

  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {list.map((o) => (
        <option key={o.v} value={o.v}>
          {o.label}
        </option>
      ))}
    </select>
  );
};

export default PeriodSelector;
