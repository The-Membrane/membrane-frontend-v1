import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartProps {
  dataset?: number[];
  barSize?: number;
  borderRadius?: number;
}

const ChartComponent: React.FC<ChartProps> = ({
  dataset,
  barSize = 20,
  borderRadius = 90,
}) => {
  // Use provided dataset or default to dummy data
  const dataValues =
    dataset ||
    Array.from({ length: 10 }, () => Math.floor(Math.random() * 100));

  // Find the maximum value in the dataset for Y-axis scaling
  const maxValue = Math.max(...dataValues);

  // Map data for the bars
  const data = dataValues.map((value, index) => ({
    name: `${index}%`,
    value,
    maxValue,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart barGap={-barSize} data={data}>
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="rgba(121, 142, 255, 1)" />
            <stop offset="95%" stopColor="rgba(79, 202, 187, 1)" />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="name" axisLine={false} tick={{ fill: "#FFFFFF" }} />
        <YAxis
          axisLine={false}
          domain={[0, maxValue]}
          tick={{ fill: "#FFFFFF" }}
        />
        <Tooltip
            content={<CustomTooltip active={true} payload={[]} label="Example Label" />}
            cursor={{ fill: "rgba(0, 0, 0, 0.2)" }}
        />
        {/* Background Bars */}
        <Bar
          dataKey="maxValue"
          barSize={barSize}
          fill="rgba(0, 0, 0, 0.2)"
          radius={borderRadius}
        />
        {/* Gradient Bars */}
        <Bar
          dataKey="value"
          barSize={barSize}
          fill="url(#barGradient)"
          radius={borderRadius}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

interface CTProps {
  active: boolean;
  payload: any[];
  label: string;
}

const CustomTooltip: React.FC<CTProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const gradientBarPayload = payload.find((p) => p.dataKey === "value");
    return (
      <div
        style={{
          backgroundColor: "#4A5568", // This is Chakra's gray.700
          padding: "16px",
          borderRadius: "10px",
          color: "white",
        }}
      >
        <p>{`${label} Discount`}</p>
        <p>{`${gradientBarPayload.value} CDT`}</p>
      </div>
    );
  }

  return null;
};

export default ChartComponent;
