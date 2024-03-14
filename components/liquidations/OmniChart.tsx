"use client";
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
import { Box } from "@chakra-ui/react";

export interface DataItem {
  name: string;
  others: number;
  user: number;
}

const OmniChartComponent: React.FC<{ dataset?: DataItem[] }> = ({
  dataset,
}) => {
  const blank = Array.from({ length: 1 }, (_, index) => ({
    name: `Item ${index + 1}`,
    user: 100,
    others: 1000,
  }));
  var data = dataset || blank;
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        layout="horizontal" // Horizontal layout for vertical bars
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis dataKey=" " axisLine={false} tick={{ fill: "#FFFFFF" }} />
        <YAxis axisLine={false} tick={{ fill: "#FFFFFF" }} />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: "rgba(0, 0, 0, 0.2)" }}
        />
        <Bar
          dataKey="others"
          fill="#798EFF"
          barSize={80}
          radius={[0, 0, 10, 10]}
          stackId="a"
        />{" "}
        <Bar
          dataKey="user"
          fill="#4FD1C5"
          barSize={80}
          radius={[10, 10, 0, 0]}
          stackId="a"
        />{" "}
      </BarChart>
    </ResponsiveContainer>
  );
};

interface TooltipProps {
  active?: boolean;
  payload?: { name: string; value: number }[];
}

const CustomTooltip: React.FC<TooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: "#4A5568",
          padding: "16px",
          borderRadius: "10px",
          color: "white",
        }}
      >
        <p>{`User: ${payload[1].value}`}</p>
        <p>{`Others: ${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};

export default OmniChartComponent;
