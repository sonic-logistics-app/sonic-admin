"use client";

import { Chart } from "primereact/chart";

const defaultLineData = {
  labels: ["January", "February", "March", "April", "May", "June", "July"],
  datasets: [
    {
      label: "Revenue",
      data: [65, 59, 80, 81, 56, 55, 40],
      fill: false,
      backgroundColor: "#2f4860",
      borderColor: "#2f4860",
      tension: 0.4,
    },
    {
      label: "Sales",
      data: [28, 48, 40, 19, 86, 27, 90],
      fill: false,
      backgroundColor: "#00bb7e",
      borderColor: "#00bb7e",
      tension: 0.4,
    },
  ],
};

interface SalesChartProps {
  data?: any;
}

export default function SalesChart({ data }: SalesChartProps) {
  return (
    <div className="card">
      <h5>Sales Overview</h5>
      <Chart type="line" data={data ?? defaultLineData} />
    </div>
  );
}
