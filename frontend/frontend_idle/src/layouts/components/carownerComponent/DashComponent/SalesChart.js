import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "../../../../theme/CarOwner/cardashboard.css";
const SalesChart = ({ data }) => {
  return (
    <div className="chart-box">
      <h2>매출 및 운송건수</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="sales" stroke="#007bff" name="매출" />
          <Line type="monotone" dataKey="deliveries" stroke="#28a745" name="운송건수" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;